"use client";

import { useEffect, useRef } from "react";

/** A deliberately quiet, GPU-drawn light field for the site background. */
export default function AmbientCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const gl = element.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vertex = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
    const fragment = `
      precision mediump float;
      uniform vec2 resolution;
      uniform float time;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float drift = sin(uv.y * 4.0 + time * 0.12) * 0.08;
        float glowA = smoothstep(0.72, 0.05, length(uv - vec2(0.88, 0.78 + drift)));
        float glowB = smoothstep(0.62, 0.0, length(uv - vec2(0.12, 0.20 - drift)));
        vec3 gold = vec3(0.72, 0.58, 0.25) * glowA * 0.075;
        vec3 rose = vec3(0.56, 0.34, 0.26) * glowB * 0.045;
        gl_FragColor = vec4(gold + rose, 1.0);
      }
    `;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram();
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!program || !vs || !fs) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    const resolution = gl.getUniformLocation(program, "resolution");
    const time = gl.getUniformLocation(program, "time");
    let frame = 0;
    let start = performance.now();

    const render = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.ceil(window.innerWidth * dpr);
      const height = Math.ceil(window.innerHeight * dpr);
      if (element.width !== width || element.height !== height) {
        element.width = width;
        element.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.useProgram(program);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvas} className="ambient-canvas" aria-hidden="true" />;
}

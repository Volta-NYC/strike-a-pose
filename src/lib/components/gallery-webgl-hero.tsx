"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform vec2 resolution;
  uniform float time;

  float glow(vec2 point, vec2 center, float radius) {
    return radius / max(length(point - center), 0.012);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.x *= resolution.x / resolution.y;
    float t = time * 0.00017;
    vec2 a = vec2(0.32 + sin(t) * 0.10, 0.56 + cos(t * 1.3) * 0.14);
    vec2 b = vec2(1.44 + cos(t * 0.8) * 0.14, 0.31 + sin(t * 1.1) * 0.12);
    vec2 c = vec2(0.86 + sin(t * 0.7) * 0.18, 0.92 + cos(t * 0.9) * 0.10);
    float light = glow(uv, a, 0.025) + glow(uv, b, 0.019) + glow(uv, c, 0.014);
    float ribbon = sin((uv.x * 4.2 + uv.y * 2.0) + t * 3.0) * 0.04;
    float vignette = smoothstep(1.30, 0.20, length(uv - vec2(0.9, 0.52)));
    vec3 base = vec3(0.045, 0.040, 0.028);
    vec3 gold = vec3(0.80, 0.62, 0.23);
    vec3 color = base + gold * (light * 0.17 + ribbon + 0.055) * vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export default function GalleryWebglHero() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext("webgl", { alpha: false });
    if (!gl) return;
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    if (!buffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "resolution");
    const time = gl.getUniformLocation(program, "time");
    let frame = 0;
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(element.clientWidth * scale);
      element.height = Math.round(element.clientHeight * scale);
      gl.viewport(0, 0, element.width, element.height);
    };
    const render = (now: number) => {
      gl.uniform2f(resolution, element.width, element.height);
      gl.uniform1f(time, now);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        frame = requestAnimationFrame(render);
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    frame = requestAnimationFrame(render);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <section className="page-hero gallery-webgl-hero">
      <canvas className="page-hero-webgl" ref={canvas} aria-hidden="true" />
      <div className="page-hero-shade" />
      <div className="page-intro container page-hero-content">
        <p className="eyebrow">Through our lens</p>
        <h1>Good times. Great keepsakes.</h1>
        <p className="intro-copy">
          A glimpse of our booths, our celebrations, and the people who make
          every event special.
        </p>
      </div>
    </section>
  );
}

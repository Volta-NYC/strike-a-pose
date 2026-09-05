"use client";

import { useEffect, useRef } from "react";

const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform vec2 resolution, pointer;
uniform float time;
void main(){
 vec2 uv=(gl_FragCoord.xy*2.-resolution)/min(resolution.x,resolution.y);
 vec2 m=(pointer*2.-1.)*vec2(resolution.x/resolution.y,1.);
 float t=time*.095;
 vec2 p=uv*.82;
 p+=vec2(sin(p.y*1.5-t),cos(p.x*1.25+t))*.23;
 p+=vec2(sin((p.x+p.y)*1.1+t),cos((p.x-p.y)*1.25-t))*.12;
 p+=(m-p)*exp(-1.35*length(uv-m))*.075;
 float current=sin(p.x*2.45+sin(p.y*1.55-t)*1.25+sin((p.x+p.y)*1.05+t)*.72);
 float drift=sin(p.y*2.05+sin(p.x*1.35+t)*1.05);
 float mist=smoothstep(.18,.92,.5+.5*(current*.68+drift*.32));
 float gleam=smoothstep(.67,.94,.5+.5*sin(p.x*3.35-p.y*1.18+t*.55+drift));
 vec3 cloud=vec3(.95,.92,.86), champagne=vec3(.91,.75,.43), blush=vec3(.76,.52,.47);
 vec3 color=mix(cloud,champagne,mist*.34);
 color=mix(color,blush,smoothstep(.74,1.,mist)*.16);
 color=mix(color,vec3(1.,.91,.64),gleam*.52);
 gl_FragColor=vec4(color,.52);
}`;

/** A slow, seamless water-mist field that moves behind non-hero page content. */
export default function EventField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    const makeShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram();
    const vs = makeShader(gl.VERTEX_SHADER, vertex);
    const fs = makeShader(gl.FRAGMENT_SHADER, fragment);
    if (!program || !vs || !fs) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "resolution");
    const pointerLocation = gl.getUniformLocation(program, "pointer");
    const clock = gl.getUniformLocation(program, "time");
    const pointer = { x: 0.68, y: 0.46 };
    const target = { ...pointer };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      target.x = (event.clientX - bounds.left) / bounds.width;
      target.y = 1 - (event.clientY - bounds.top) / bounds.height;
    };
    const draw = (now: number) => {
      resize();
      pointer.x += (target.x - pointer.x) * 0.035;
      pointer.y += (target.y - pointer.y) * 0.035;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(clock, reduced ? 9 : (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    draw(start);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <canvas ref={canvasRef} className="event-field" aria-hidden="true" />;
}

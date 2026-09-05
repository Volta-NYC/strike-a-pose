"use client";

import { useEffect, useRef } from "react";

const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform vec2 resolution, pointer;
uniform float time;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}
void main(){
 vec2 uv=(gl_FragCoord.xy*2.-resolution)/min(resolution.x,resolution.y);
 vec2 m=(pointer*2.-1.)*vec2(resolution.x/resolution.y,1.); float t=time*.1;
 float f=fbm(uv*1.2+vec2(t,-t*.7)); f+=exp(-3.4*length(uv-m*.32))*.22;
 float bands=smoothstep(.46,.88,f+sin((uv.x+uv.y)*2.0-t)*.08);
 vec3 night=vec3(.05,.045,.032), brass=vec3(.78,.60,.25), rose=vec3(.52,.18,.20);
 vec3 color=mix(night,brass,bands*.46); color=mix(color,rose,smoothstep(.68,.96,f)*.30);
 gl_FragColor=vec4(color,.72);
}`;

/** A subtle, pointer-reactive light field reserved for image-led heroes. */
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

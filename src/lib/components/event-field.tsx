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
 float t=time*.055;
 vec2 p=uv*.9;
 p+=vec2(sin(p.y*1.7+t),cos(p.x*1.35-t))*.16;
 p+=vec2(sin((p.y+p.x)*1.15-t*.7),cos((p.x-p.y)*1.4+t))*.08;
 p+=(m-p)*exp(-1.5*length(uv-m))*.045;
 float vein=sin(p.x*3.1+sin(p.y*2.25-t)*1.15+sin((p.x+p.y)*1.4+t)*.65);
 float fold=sin(p.y*2.6+sin(p.x*1.8+t)*.8);
 float light=smoothstep(-.78,.92,vein*.72+fold*.28);
 vec3 paper=vec3(.96,.93,.87), champagne=vec3(.79,.66,.39), rose=vec3(.66,.42,.42), ink=vec3(.24,.18,.20);
 vec3 color=mix(paper,champagne,smoothstep(.42,.85,light)*.45);
 color=mix(color,rose,smoothstep(.64,.94,light+fold*.11)*.34);
 color=mix(color,ink,smoothstep(.82,1.0,1.-light)*.14);
 gl_FragColor=vec4(color,.20);
}`;

/** A slow, seamless marble field that moves behind non-hero page content. */
export default function EventField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const syncHeroVisibility = () => {
      const heroIsVisible = Array.from(
        document.querySelectorAll<HTMLElement>(".hero, .page-hero"),
      ).some((hero) => {
        const bounds = hero.getBoundingClientRect();
        return bounds.top < window.innerHeight && bounds.bottom > 0;
      });
      canvas.classList.toggle("event-field--hero-hidden", heroIsVisible);
    };
    const main = document.getElementById("main");
    const routeObserver = new MutationObserver(syncHeroVisibility);
    routeObserver.observe(main ?? document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", syncHeroVisibility, { passive: true });
    window.addEventListener("resize", syncHeroVisibility);
    syncHeroVisibility();
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
      window.removeEventListener("resize", syncHeroVisibility);
      window.removeEventListener("scroll", syncHeroVisibility);
      window.removeEventListener("pointermove", move);
      routeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="event-field event-field--hero-hidden"
      aria-hidden="true"
    />
  );
}

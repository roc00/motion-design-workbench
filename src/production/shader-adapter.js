const VERTEX = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_progress;
uniform float u_alpha;
uniform int u_mode;
uniform sampler2D u_from;
uniform sampler2D u_to;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=v_uv;
  if(u_mode==0){
    float flow=.5+.5*sin(u_time*.34+uv.x*4.2-uv.y*2.1);
    float grain=(hash(floor(uv*u_resolution*.12))-0.5)*.035;
    vec3 a=vec3(.025,.035,.03), b=vec3(.28,.53,.04), c=vec3(.03,.18,.17);
    vec3 col=mix(a,b,smoothstep(.2,1.,flow)*.34)+c*smoothstep(.72,.1,distance(uv,vec2(.72,.28)))*.35+grain;
    outColor=vec4(col,u_alpha);
  }else{
    vec4 a=texture(u_from,uv), b=texture(u_to,uv);
    float n=(hash(floor(uv*u_resolution*.18))-.5)*.16;
    float edge=u_mode==1?uv.x:n+uv.x*.35+uv.y*.65;
    float k=smoothstep(u_progress-.055,u_progress+.055,edge);
    outColor=mix(a,b,k)*u_alpha;
  }
}`;

const MODE = { "ambient-gradient": 0, wipe: 1, dissolve: 2 };

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader 编译失败");
  return shader;
}

export function createShaderAdapter({ canvas, effect = "ambient-gradient", width, height, quality = "medium", fallbackElement }) {
  const status = { state: "initializing", effect, quality, fallback: false, error: null };
  let gl;
  let program;
  const textures = new Map();
  try {
    if (!(effect in MODE)) throw new Error(`未知 Shader：${effect}`);
    const scale = quality === "low" ? 0.5 : quality === "high" ? 1 : 0.75;
    canvas.width = Math.max(2, Math.round(width * scale));
    canvas.height = Math.max(2, Math.round(height * scale));
    gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) throw new Error("WebGL2 不可用");
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Shader 链接失败");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    status.state = "ready";
  } catch (error) {
    status.state = "fallback";
    status.fallback = true;
    status.error = error.message;
    if (fallbackElement) fallbackElement.dataset.shaderFallback = "1";
  }

  const textureFor = (source, unit) => {
    if (!source) throw new Error("转场 Shader 需要前后两个输入画面");
    let tex = textures.get(source);
    if (!tex) {
      tex = gl.createTexture();
      textures.set(source, tex);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
    return tex;
  };

  return {
    status,
    render({ timeSec = 0, progress = 0, alpha = 1, blend = "normal", from = null, to = null } = {}) {
      canvas.style.mixBlendMode = blend;
      if (!gl || !program) return status;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), timeSec);
      gl.uniform1f(gl.getUniformLocation(program, "u_progress"), Math.max(0, Math.min(1, progress)));
      gl.uniform1f(gl.getUniformLocation(program, "u_alpha"), Math.max(0, Math.min(1, alpha)));
      gl.uniform1i(gl.getUniformLocation(program, "u_mode"), MODE[effect]);
      if (MODE[effect] > 0) {
        textureFor(from, 0);
        textureFor(to, 1);
        gl.uniform1i(gl.getUniformLocation(program, "u_from"), 0);
        gl.uniform1i(gl.getUniformLocation(program, "u_to"), 1);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return status;
    },
    destroy() {
      for (const tex of textures.values()) gl?.deleteTexture(tex);
      if (program) gl?.deleteProgram(program);
      textures.clear();
      canvas.width = 1;
      canvas.height = 1;
      status.state = "destroyed";
    },
  };
}

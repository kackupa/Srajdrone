import * as T from "three";

// World-only camera treatment: the HTML reticle and telemetry stay crisp.
// No delayed frames, simulated input latency or camera shake.
export class DroneFeed {
  private target = new T.WebGLRenderTarget(1, 1, { depthBuffer: true });
  private scene = new T.Scene();
  private size = new T.Vector2();
  private camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private material = new T.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      feed: { value: this.target.texture },
      time: { value: 0 },
      thermal: { value: 0 },
      texel: { value: new T.Vector2() },
    },
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `uniform sampler2D feed;uniform float time;uniform float thermal;
      uniform vec2 texel;varying vec2 vUv;
      void main(){
        vec2 p=vUv;
        vec3 c=texture2D(feed,p).rgb;
        c.r=mix(c.r,texture2D(feed,p+vec2(texel.x,0.)).r,.23*(1.-thermal));
        c.b=mix(c.b,texture2D(feed,p-vec2(texel.x,0.)).b,.23*(1.-thermal));
        float l=dot(c,vec3(.2126,.7152,.0722));
        c=mix(c,vec3(l),.10*(1.-thermal));
        float grain=fract(sin(dot(floor(p/texel),vec2(12.9898,78.233))+time)*43758.5453)-.5;
        c+=grain*.004*(.3+min(l*3.,1.));
        c*=1.-.16*dot(p-.5,p-.5);
        gl_FragColor=vec4(max(c,vec3(0.)),1.);
        #include <colorspace_fragment>
      }`,
  });
  constructor() {
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);
  }
  render(
    renderer: T.WebGLRenderer,
    scene: T.Scene,
    camera: T.Camera,
    fpv: boolean,
    thermal: boolean,
    time: number,
    reducedMotion: boolean,
  ) {
    if (!fpv) {
      renderer.render(scene, camera);
      return;
    }
    const size = renderer.getSize(this.size);
    const scale = Math.min(0.85, 1280 / size.x, 720 / size.y);
    const w = Math.max(1, Math.round(size.x * scale)),
      h = Math.max(1, Math.round(size.y * scale));
    if (this.target.width !== w || this.target.height !== h)
      this.target.setSize(w, h);
    this.material.uniforms.texel.value.set(1 / w, 1 / h);
    this.material.uniforms.time.value = reducedMotion
      ? 0
      : Math.floor(time * 24);
    this.material.uniforms.thermal.value = thermal ? 1 : 0;
    renderer.setRenderTarget(this.target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }
}

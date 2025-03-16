precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;

void main() {
    vec2 pixel = gl_FragCoord.xy / uResolution.xy;
    vec4 color = texture2D(uMainSampler, pixel);

    // Simple bayer matrix dithering pattern
    float ditherPattern[4] = float[4](0.0, 0.5, 0.75, 0.25);
    int x = int(mod(gl_FragCoord.x, 2.0));
    int y = int(mod(gl_FragCoord.y, 2.0));
    float threshold = ditherPattern[y * 2 + x];

    float grayscale = (color.r + color.g + color.b) / 3.0;
    float dithered = step(threshold, grayscale);

    gl_FragColor = vec4(vec3(dithered), 1.0);
}

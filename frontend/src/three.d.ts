declare module 'three' {
    export class Scene {
        add(object: any): void;
        remove(object: any): void;
    }
    
    export class PerspectiveCamera {
        constructor(fov: number, aspect: number, near: number, far: number);
        position: { x: number; y: number; z: number };
        aspect: number;
        updateProjectionMatrix(): void;
    }
    
    export class WebGLRenderer {
        constructor(options?: { antialias?: boolean, alpha?: boolean });
        setSize(width: number, height: number): void;
        setPixelRatio(ratio: number): void;
        setClearColor(color: number, alpha: number): void;
        domElement: HTMLCanvasElement;
        render(scene: Scene, camera: PerspectiveCamera): void;
        dispose(): void;
    }
    
    export class BufferGeometry {
        setAttribute(name: string, attribute: BufferAttribute): void;
        dispose(): void;
    }
    
    export class BufferAttribute {
        constructor(array: Float32Array, itemSize: number);
    }
    
    export class BoxGeometry {
        constructor(width: number, height: number, depth: number);
    }
    
    export class SphereGeometry {
        constructor(radius: number, widthSegments: number, heightSegments: number);
    }
    
    export class MeshBasicMaterial {
        constructor(options: { color?: number | string, wireframe?: boolean });
        dispose(): void;
    }
    
    export class PointsMaterial {
        constructor(options: { 
            size?: number, 
            color?: number | string,
            transparent?: boolean,
            opacity?: number,
            blending?: number
        });
        dispose(): void;
    }
    
    export class Mesh {
        constructor(geometry: any, material: any);
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
    }
    
    export class Points {
        constructor(geometry: BufferGeometry, material: PointsMaterial);
        rotation: { 
            x: number; 
            y: number; 
            z: number;
        };
    }
    
    export class Color {
        constructor(color: number | string);
    }
    
    export const DoubleSide: number;
    export const AdditiveBlending: number;
} 
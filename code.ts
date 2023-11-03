// Assuming you have set up the Figma plugin properly and initialized it
figma.showUI(__html__, { width: 240, height: 240 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'extrudeShape') {
        await extrudeSelectedShape(msg.depth);
        await updateImagePreview();
    }
}

async function updateImagePreview() {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) return;

    const selectedNode = selection[0];
    const exportSettings: ExportSettings = { format: 'PNG' };
    const exportData = await selectedNode.exportAsync(exportSettings);

    // Convert Uint8Array to Base64
    const base64Image = `data:image/png;base64,${arrayBufferToBase64(exportData)}`;
    
    // Send the image to UI for preview
    figma.ui.postMessage({ type: 'updateImage', image: base64Image });
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((byte) => binary += String.fromCharCode(byte));
    return btoa(binary);
}

async function extrudeSelectedShape(depth: number) {
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) {
        console.error('Please select a single shape to extrude.');
        return;
    }

    const node = selection[0];

    if (node.type !== 'RECTANGLE') {
        console.error('Currently, only rectangles are supported for extrusion.');
        return;
    }

    for (let i = 1; i <= depth; i++) {
        const clone = node.clone();
        clone.x += i;
        clone.y += i;
        figma.currentPage.appendChild(clone);
    }
}

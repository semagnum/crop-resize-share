const originalImage = document.getElementById('originalImage');
const preview = document.getElementById('preview');
const shareButton = document.getElementById('share');

const errorMessage = document.getElementById('error');

document.onpaste = function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            const blob = item.getAsFile();
            const url = URL.createObjectURL(blob);
            updateImages(url);
            break;
        }
    }
};

function updateImages(url) {
    // reset values
    document.getElementById('cropLeft').value = '';
    document.getElementById('cropRight').value = '';
    document.getElementById('cropTop').value = '';
    document.getElementById('cropBottom').value = '';
    document.getElementById('resizeWidth').value = '';
    document.getElementById('resizeHeight').value = '';

    originalImage.setAttribute('crossorigin', 'anonymous');
    originalImage.src = url;
    originalImage.onload = () => {
        updateCanvas();
        document.getElementById("controls").style.display = 'block';
        window.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                updateCanvas();
            }
        });
    };
}

function onImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        url = URL.createObjectURL(file);
        updateImages(url);
    }
}

function onImageUrlUpload(e) {
    const url = e.target.value;
    updateImages(url);
}

function updateCanvas() {
    const cropLeft = parseInt(document.getElementById('cropLeft').value) || 0;
    const cropRight = parseInt(document.getElementById('cropRight').value) || 0;
    const cropTop = parseInt(document.getElementById('cropTop').value) || 0;
    const cropBottom = parseInt(document.getElementById('cropBottom').value) || 0;

    const newWidth = originalImage.width - cropLeft - cropRight;
    const newHeight = originalImage.height - cropTop - cropBottom;

    if (newWidth < 1 || newHeight < 1 || cropLeft < 0 || cropRight < 0 || cropTop < 0 || cropBottom < 0) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Invalid resize dimensions.';
        return;
    }
    else {
        errorMessage.style.display = 'none';
    }

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, cropLeft, cropTop, newWidth, newHeight, 0, 0, newWidth, newHeight);

    if (errorMessage.style.display !== 'block') {
        resize(canvas);
    }
    preview.src = canvas.toDataURL();
    preview.style.display = 'inline';
    document.getElementById('dimensions').innerText = canvas.width + "x" + canvas.height;
}

function resize(canvas) {
    const resizeWidth = parseInt(document.getElementById('resizeWidth').value) || 0;
    const resizeHeight = parseInt(document.getElementById('resizeHeight').value) || 0;

    let width, height;

    if (resizeWidth > 1 && resizeHeight > 1) {
        width = resizeWidth;
        height = resizeHeight;
    }
    else if (resizeWidth > 1) {
        width = resizeWidth;
        height = width * (canvas.height / canvas.width);
    }
    else if (resizeHeight > 1) {
        height = resizeHeight;
        width = height * (canvas.width / canvas.height);
    }
    else {  // no resize
        return
    }

    current_width = canvas.width;
    current_height = canvas.height;

    while (current_width != width || current_height != height) {
        if ((current_width / 2) > width && (current_height / 2) > height) {
            current_width /= 2;
            current_height /= 2;
        }
        else {
            current_width = width;
            current_height = height;
        }

        const oc = document.createElement('canvas');
        oc.width = current_width;
        oc.height = current_height;
        oc.getContext('2d').drawImage(canvas, 0, 0, current_width, current_height);

        canvas.width = current_width;
        canvas.height = current_height;
        canvas.getContext('2d').drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, current_width, current_height);
    }
}
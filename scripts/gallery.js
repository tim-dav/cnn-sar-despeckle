const methods = ['x', 'logl2_epoch1000', 'linl2_epoch1000', 'tavg', 'b3d', 'lee'];
const methodLabels = [ 'Input', 'Log. CNN', 'Lin. CNN', 'Temporal Avg.', 'BM3D', 'Lee'];
const dim = 300;

let currentImg = null;
let currentPolarity = 'vv';
let lastX = 0;
let lastY = 0;
let fullWidth = 0;
let fullHeight = 0;

function getSource(method, imgInfo, polarity = currentPolarity) {
  let src = `images/sets/${imgInfo.set}/${polarity}/${imgInfo.acquisition}_${method}_int_${polarity}.jpg`
  return src;
}

function loadImages(imgInfo, images, contexts, polarity = currentPolarity) {
  fullHeight = imgInfo.height;
  fullWidth = imgInfo.width;
  let loaded = methods.length;
  document.getElementsByClassName('content-wrapper')[0].style.cursor = "wait";
  methods.forEach((m, i) => {
    let img = document.getElementById(`img_${m}`);
    img.onload = () => { 
      drawPatches(images, contexts, lastX, lastY, polarity); 
      loaded--;
      if (loaded == 0)
        document.getElementsByClassName('content-wrapper')[0].style.cursor = "auto";
    }
    img.src = getSource(m, imgInfo, polarity);
  });
}

function createCanvases(imgInfo) {
  let contexts = []
  methods.forEach((m, i) => {
    let canvasDiv = document.createElement('div');
    canvasDiv.style.display = 'inline-block';
    canvasDiv.style.margin = 10;
    let canvas = document.createElement('canvas');
    canvas.id = `canvas_${m}`;
    canvas.classList.add('patch');
    canvasDiv.appendChild(canvas);
    let label = document.createElement('strong');
    label.textContent = methodLabels[i];
    canvasDiv.appendChild(label);
    wrapper = document.getElementById('canvas-wrapper');
    wrapper.appendChild(canvasDiv);
    if (i == 2) {
      let br = document.createElement('br');
      wrapper.appendChild(br);
    }
    contexts.push(canvas.getContext('2d'));
  });
  return contexts;
}

function createImages(imgInfo) {
  images = []
  methods.forEach((m, i) => {
    let img = document.createElement('img');
    img.id = `img_${m}`;
    if (i === 0) {
      img.style.maxWidth = '100%';
      img.style.maxHeight = 400;
    } else img.style.display = 'none';
    let wrapper = document.getElementById('img-wrapper');
    wrapper.appendChild(img);
    images.push(img);
  });
  return images;
}

function addMouseMoveListener(image_x, images, contexts) {
  image_x.addEventListener("mousemove", (e) => {
    // TODO get pixel ratio for calculations
    const rect = e.target.getBoundingClientRect();
    const displayWidth = e.target.width;
    const displayHeight = e.target.height;
    const dimX = dim * displayWidth / fullWidth;
    const dimY = dim * displayHeight / fullHeight
    let x = e.clientX - rect.left;
    x = Math.max(Math.min(x, displayWidth - dimX / 3), dimX / 1.5);
    let y = e.clientY - rect.top;
    y = Math.max(Math.min(y, displayHeight - dimY / 4), dimY / 4);
    lastX = fullWidth * x / displayWidth - dim / 1.5;
    lastY = fullHeight * y / displayHeight - dim / 4;
      
    drawPatches(images, contexts, lastX, lastY);
  }, false);
}

function drawPatches(images, contexts, x, y) {
  contexts.forEach((ctx, i) => {
    ctx.drawImage(images[i], x, y, dim, dim, 0, 0, dim, dim);
  });
}

function setup(csv) {
  // TODO create image control
  // TODO set src of main image
  currentImg = csv[0];
  fullWidth = currentImg.width;
  fullHeight = currentImg.height;
  images = createImages(currentImg);
  contexts = createCanvases(currentImg);
  loadImages(currentImg, images, contexts);
  
  document.getElementsByName('polarity').forEach((input) => {
    input.addEventListener('change', (e) => {
      currentPolarity = e.target.value || currentPolarity;
      if (e.target.checked) {
        loadImages(currentImg, images, contexts, currentPolarity);
      }
    }, false);
  });

  let options = []
  csv.forEach((row, i) => {
    let opt = document.createElement('option');
    opt.textContent = row.volcano + ': orbit ' + row.orbit;
    opt.value = row.acquisition;
    if (i == 0) opt.selected = 'selected';
    options.push(opt);
  });
  
  let select = document.getElementById('select_img');
  options.sort((a, b) => a.textContent >  b.textContent).forEach((opt) => {
    select.appendChild(opt);
  });

  select.addEventListener('change', (e) => {
    currentImg = csv.find((row) => row.acquisition === e.target.value);
    loadImages(currentImg, images, contexts);
  });
}

function onImageChange(imgInfo, images, contexts) {
  loadImages(imgInfo, images, contexts);
}

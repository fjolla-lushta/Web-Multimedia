var loader = new PIXI.Loader()			
document.querySelectorAll('.slide-img').forEach(img => {
  loader.add(img.src)
});
loader
  .once('complete', function(loader, resources) {	init();})			
  .load();

function init(){  
  const slider = document.querySelector('.slider');
  const sliderImgs = slider.querySelectorAll('.slide');
  let sliderWidth = 0;
  let mouseDown = false;
  let mouseStart = {x: 0, y: 0};
  let mousePos = {x: 0, y: 0};
  let sliderPos = 0;
  let canvasPos = {x:0};
  let resolution = {x: window.innerWidth, y: window.innerHeight};
  let time = 0;
  let pixiImgs = [];
  let isScrolling;
  

  const uniforms = {};
  uniforms.u_mouse = mousePos;
  uniforms.u_resolution = resolution;
  uniforms.u_time = time;
  uniforms.u_strength = 1.0;

  const nextBtn = document.querySelector('.slider-nav-next');
  const prevBtn = document.querySelector('.slider-nav-prev');

  function makeSize() {
    console.log('hallo')
    sliderImgs.forEach(slide => {
      sliderWidth += slide.offsetWidth + 5;
    })
    slider.style.width = sliderWidth + 'px';
  }
  makeSize()

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('touchstart', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('touchend', onMouseUp);

  // Listen for scroll events
  window.addEventListener('wheel', function ( e ) {
    canvasPos.x -= e.deltaY
    slider.style.transform = 'translateX(' + canvasPos.x + 'px)';
    // Clear our timeout throughout the scroll
    window.clearTimeout( isScrolling );

    // Set a timeout to run after scrolling ends
    isScrolling = setTimeout(function() {
      sliderPos = canvasPos.x;
       let newPos = Math.round(sliderPos/sliderWidth * sliderImgs.length)
    let slideWidth = sliderWidth/sliderImgs.length;
    console.log(newPos);
    if (newPos < -1 * (sliderImgs.length-1)) {
      newPos = -1 * (sliderImgs.length-1)
    } else if(newPos > 0) {
      newPos = 0;
    }
    gsap.to(canvasPos, .3, {x: newPos*slideWidth});
    gsap.fromTo(slider, .3, {x: sliderPos},{x: newPos*slideWidth});
    gsap.to(slider, .3, {x: newPos*slideWidth});
    sliderPos = newPos*slideWidth;
      // Run the callback
      console.log( 'Scrolling has stopped.' );

    }, 66);

  }, false);



  function onMouseDown(e) {
    e.preventDefault()
    mouseDown = true;
    gsap.to(uniforms, 1, {u_strength: 10.0});
    mouseStart.x = e.clientX || e.touches[0].clientX;
    mouseStart.y = e.clientY || e.touches[0].clientY;
  }

  function onMouseMove(e) {
    mousePos.x = e.clientX || e.touches[0].clientX;
    mousePos.y = e.clientY || e.touches[0].clientY;
    if (mouseDown) {
      canvasPos.x = (sliderPos + mousePos.x - mouseStart.x)
      slider.style.transform = 'translateX(' + canvasPos.x + 'px)';
    }

  }

  function onMouseUp() {
    gsap.to(uniforms, 1, {u_strength: 1.0});
    mouseDown = false;
    //Update Slider Position
    sliderPos += (mousePos.x - mouseStart.x);
    //Go to the nearest slide:
    //get a rounded negativ Index to multiply later
    let newPos = Math.round(sliderPos/sliderWidth * sliderImgs.length)
    let slideWidth = sliderWidth/sliderImgs.length;
    console.log(newPos);
    if (newPos < -1 * (sliderImgs.length-1)) {
      newPos = -1 * (sliderImgs.length-1)
    } else if(newPos > 0) {
      newPos = 0;
    }
    gsap.to(canvasPos, .3, {x: newPos*slideWidth});
    gsap.fromTo(slider, .3, {x: sliderPos},{x: newPos*slideWidth});
    gsap.to(slider, .3, {x: newPos*slideWidth});
    sliderPos = newPos*slideWidth;
  }

  function slideNext() {
    let slideTo = canvasPos.x - (sliderWidth/sliderImgs.length);
    if (slideTo > sliderWidth * -1 && slideTo <= 0) {
      sliderPos = slideTo;
      gsap.to(canvasPos, .3, {x: slideTo});
      gsap.to(slider, .3, {x: slideTo});
    }

  }
  nextBtn.addEventListener('click', slideNext);

  function slidePrev() {
    let slideTo = canvasPos.x + (sliderWidth/sliderImgs.length);
    if (slideTo > sliderWidth * -1 && slideTo <= 0) {
      sliderPos = slideTo;
      gsap.to(canvasPos, .3, {x: slideTo});
      gsap.to(slider, .3, {x: slideTo});
    }
  }
  prevBtn.addEventListener('click', slidePrev);

  // PIXI Stuff

  var app = new PIXI.Application({ width: resolution.x, height: resolution.y });

  document.body.appendChild(app.view);

  var bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.width = resolution.x;
  bg.height = resolution.y;
  bg.tint = 0x222222;
  app.stage.addChild(bg);

  var container = new PIXI.Container();
  app.stage.addChild(container);

  sliderImgs.forEach((slide,idx) => {
    const img = slide.querySelector('img');
    const imgRect = img.getBoundingClientRect();
    pixiImgs[idx] = PIXI.Sprite.from(img.src);
    pixiImgs[idx].width = imgRect.width;
    pixiImgs[idx].height = imgRect.height;
    pixiImgs[idx].x = imgRect.left;
    pixiImgs[idx].y = imgRect.top;
    container.addChild(pixiImgs[idx]);
    img.style.display = 'none';
  })

  //Get shader code as a string
  var shaderCode = document.getElementById("shader").innerHTML
  //Create our Pixi filter using our custom shader code


  var simpleShader = new PIXI.Filter('',shaderCode, uniforms );
  simpleShader.padding = 200;
  //Apply it to our object
  app.stage.filters = [simpleShader];



  app.ticker.add(() =>{
    container.x = canvasPos.x;
    time += .01;
    uniforms.u_time = time;
  })
}
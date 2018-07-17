class Desktop {
  constructor()
  {
    this.body = document.querySelector('body');
    this.bodyRect = this.body.getBoundingClientRect();
    this.bg = {
      src: '',
      pos: {
        x: 0,
        y: 0,
      },
      w: 0,
      h: 0,
    };
  }

  setBackground(src)
  {
    let bg = new Image();
    bg.src = src;

    let parent = this;

    bg.onload = function() {
      let w = parent.bodyRect.width;
      let h = w * (this.height / this.width);
      let t = -(h - parent.bodyRect.height) / 2;

      parent.bg.src = src;
      parent.bg.pos.x = 0;
      parent.bg.pos.y = t;
      parent.bg.w = w;
      parent.bg.h = h;

      parent.body.style.background = 'url("'+ src +'")';
      parent.body.style.backgroundSize =  w +'px '+ h +'px';
      parent.body.style.backgroundPositionY = t +'px';
    }
  }
}

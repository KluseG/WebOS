class WindowHost {
  constructor(width, height, appTitle, appID, op)
  {
    if (document.querySelector('#'+ appID) !== null) {
      document.querySelector('#'+ appID).focus();

      return;
    }

    this.width = width;
    this.height = height;
    this.minWidth = op.minWidth || width / 3;
    this.minHeight = op.minHeight || height / 3;
    this.appID = appID;
    this.appTitle = appTitle;
    this.wrapper = document.querySelector('#main');
    this.wrapper.pos = this.wrapper.getBoundingClientRect();
    this.controls = {
      close: true,
      minimize: true,
      fullscreen: true,
    };
    this.bgPos = op.desktop.pos;
      this.bgPos.x -= 1;
      this.bgPos.y -= 1;
    this.bg = op.desktop;

    this.calcPos(op);

    return this.render(op);
  }

  calcPos(options)
  {
    let coords;

    if (typeof options == 'object') {
      coords = options;
    } else {
      coords = this.wrapper;
    }

    this.pos = {
      x: coords.pos.x,
      x1: coords.pos.x,
      y: coords.pos.y,
      y1: coords.pos.y,
      mx: this.wrapper.pos.width - this.width,
      my: this.wrapper.pos.height + this.wrapper.pos.y - this.height,
    }
  }

  render(options)
  {
    this.host = this.getHost();

    this.host.append(this.getHostBar());

    this.host.append(this.getHostFrame());

    this.wrapper.append(this.host);

    this.host.focus();

    if (typeof options == 'object') {
      this.host.style.left = this.pos.x +'px';
      this.host.style.top = this.pos.y +'px';
    }

    return this;
  }

  getHost()
  {
    let host = document.createElement('div');
    host.setAttribute('class', 'window-host');
    host.setAttribute('id', this.appID);
    host.setAttribute('tabindex', '-1');
    host.style.width = this.width +'px';
    host.style.height = this.height +'px';
    host.style.zIndex = 10;

    let bg = document.createElement('div');
    bg.setAttribute('class', 'window-bg');
    bg.style.background = 'url("'+ this.bg.src +'")';
    bg.style.backgroundSize = this.bg.w +'px '+ this.bg.h +'px';
    bg.style.backgroundPositionX = -this.pos.x + this.bgPos.x +'px';
    bg.style.backgroundPositionY = -this.pos.y + this.bgPos.y +'px';

    host.append(bg);

    this.bg = host.querySelector('.window-bg');

    let handle = document.createElement('div');

    handle.setAttribute('class', 'handle');

    let parent = this;

    handle.onmousedown = function(e) {
      e.preventDefault();

      document.onmouseup = function(e) {
        parent.calcPos();

        document.onmouseup = null;
        document.onmousemove = null;
      }

      document.onmousemove = function(e) {
        let newWidth = e.clientX - parent.host.offsetLeft;
        let newHeight = e.clientY - parent.host.offsetTop;

        if (newWidth > parent.minWidth && newWidth < parent.wrapper.pos.width) {
          parent.width = newWidth;
          parent.host.style.width = parent.width +'px';
        }

        if (newHeight > parent.minHeight && newHeight < parent.wrapper.pos.height) {
          parent.height = newHeight;
          parent.host.style.height = parent.height +'px';
        }
      }
    }

    host.append(handle);

    return host;
  }

  getHostBar()
  {
    let bar = document.createElement('div');
    bar.setAttribute('class', 'top-bar');

    bar.append(this.getControls());
    bar.append(this.getTitle());

    let parent = this;

    bar.ondblclick = function(e) {
      e.preventDefault();
      e.stopPropagation();

      parent.fixedResize();
    }

    bar.onmousedown = function(e) {
      parent.host.focus();

      e = e || window.event;
      e.preventDefault();
      parent.pos.x1 = e.clientX;
      parent.pos.y1 = e.clientY;

      document.onmouseup = function(e) {
        document.onmouseup = null;
        document.onmousemove = null;
      }

      document.onmousemove = function(e) {
        e = e || window.event;
        e.preventDefault();
        parent.pos.x = parent.pos.x1 - e.clientX;
        parent.pos.y = parent.pos.y1 - e.clientY;
        parent.pos.x1 = e.clientX;
        parent.pos.y1 = e.clientY;

        let newX = parent.host.offsetLeft - parent.pos.x;
        let newY = parent.host.offsetTop - parent.pos.y;

        if (newX < parent.wrapper.pos.x) {
          parent.bg.style.backgroundPositionX = -parent.pos.x + parent.bgPos.x +"px";
          parent.host.style.left = parent.wrapper.pos.x + "px";
          parent.pos.x = parent.wrapper.pos.x;
        } else if (newX > parent.pos.mx) {
          parent.bg.style.backgroundPositionX = -parent.pos.mx + parent.bgPos.x +"px";
          parent.host.style.left = parent.pos.mx + "px";
          parent.pos.x = parent.pos.mx;
        } else {
          parent.bg.style.backgroundPositionX = -newX + parent.bgPos.x +"px";
          parent.host.style.left = newX + "px";
          parent.pos.x = newX;
        }

        if (newY < parent.wrapper.pos.y) {
          parent.bg.style.backgroundPositionY = -parent.wrapper.pos.y + parent.bgPos.y +"px";
          parent.host.style.top = parent.wrapper.pos.y + "px";
          parent.pos.y = parent.wrapper.pos.y;
        } else if (newY > parent.pos.my) {
          parent.bg.style.backgroundPositionY = -parent.wrapper.pos.my + parent.bgPos.y +"px";
          parent.host.style.top = parent.pos.my + "px";
          parent.pos.y = parent.wrapper.pos.my;
        } else {
          parent.bg.style.backgroundPositionY = -newY + parent.bgPos.y +"px";
          parent.host.style.top = newY + "px";
          parent.pos.y = newY;
        }
      }
    };

    return bar;
  }

  getHostFrame()
  {
    let frame = document.createElement('div');
    frame.setAttribute('class', 'frame');
    frame.style.width = this.width+'px';
    frame.style.height = this.height+'px';

    return frame;
  }

  getControls()
  {
    let controls = document.createElement('div');
    controls.setAttribute('class', 'window-controls');

    for (let type in this.controls) {
      if (this.controls[type]) {
        let control = document.createElement('button');
        control.setAttribute('type', 'button');
        control.setAttribute('class', type);

        let parent = this;

        control.onclick = function(e) {
          e.preventDefault();
          parent[type]();
        }

        controls.append(control);
      }
    }

    return controls;
  }

  getTitle()
  {
    let title = document.createElement('div');
    title.setAttribute('class', 'window-title');
    title.innerText = this.appTitle;

    return title;
  }

  close()
  {
    this.host.remove();
  }

  fullscreen()
  {
    if (this.fs) {
      this.fs = false;
      this.host.querySelector('.top-bar').onmousedown = this.original;
      this.host.style.left = this.pos.x +'px';
      this.host.style.top = this.pos.y +'px';
      this.host.style.width = this.width +'px';
      this.host.style.height = this.height +'px';

      let parent = this;

      setTimeout(function() {
        parent.host.classList.remove('animate');
      }, 200);
    } else {
      this.fs = true;
      this.original = this.host.querySelector('.top-bar').onmousedown;
      this.host.querySelector('.top-bar').onmousedown = null;
      this.host.classList.add('animate');
      this.host.style.left = 0 +'px';
      this.host.style.top = 0 +'px';
      this.host.style.width = window.innerWidth +'px';
      this.host.style.height = window.innerHeight +'px';
    }
  }

  minimize()
  {
    if (this.minimized) {
      this.minimized = false;
      this.host.querySelector('.top-bar').onmousedown = this.original;
      this.host.style.left = this.pos.x +'px';
      this.host.style.top = this.pos.y +'px';
      this.host.style.height = this.height +'px';
      this.host.style.width = this.width +'px';

      let parent = this;

      setTimeout(function() {
        parent.host.classList.remove('animate');
      }, 200);
    } else {
      this.minimized = true;
      this.original = this.host.querySelector('.top-bar').onmousedown;
      this.host.querySelector('.top-bar').onmousedown = null;
      this.host.classList.add('animate');
      this.host.style.height = '26px';
      this.host.style.top = window.innerHeight - 26 +'px';
      this.host.style.left = '0px';
      this.host.style.width = this.width / 3 +'px';
    }
  }

  fixedResize()
  {
    if (this.fr) {
      this.fr = false;

      this.host.classList.add('animate');

      let parent = this;

      setTimeout(function() {
        parent.host.classList.remove('animate');
      }, 200);

      this.width = this.old.width;
      this.height = this.old.height;
      this.host.style.top = this.old.pos.y + 'px';
      this.host.style.left = this.old.pos.x +'px';
      this.host.style.height = this.height +'px';
      this.host.style.width = this.width +'px';

      this.calcPos();
    } else {
      this.fr = true;

      this.host.classList.add('animate');
      this.old = {
        width: this.width,
        height: this.height,
        pos: this.pos,
      };

      let parent = this;

      setTimeout(function() {
        parent.host.classList.remove('animate');
      }, 200);

      let nh = this.wrapper.pos.height;
      let nw = nh * 1.333333;

      this.width = nw;
      this.height = nh;
      this.host.style.top = this.wrapper.pos.y + 'px';
      this.host.style.left = (this.wrapper.pos.width - nw) / 2 +'px';
      this.host.style.height = nh +'px';
      this.host.style.width = nw +'px';

      this.calcPos();
    }
  }

  setFrame(html)
  {
    this.host.querySelector('.frame').append(html);

    let parent = this;

    let obs = new MutationObserver(function(list) {
      parent.host.classList.add('focus');
      html.querySelectorAll('*').forEach(function(item) {
        item.onclick = item.onkeypress = function() {
          parent.host.classList.add('focus');
        }
        item.onblur = function() {
          parent.host.classList.remove('focus');
        }
      });
    });

    obs.observe(html, { attributes: true, childList: true, subtree: true });

    return this;
  }

  setStyle(css)
  {
    let elem = this.host.querySelector('.frame');

    Object.keys(css).forEach(function(item) {
      let target = elem.querySelector(item);

      Object.keys(css[item]).forEach(function(prop) {
        target.style[prop] = css[item][prop];
      });
    });
  }
}

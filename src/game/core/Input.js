export class Input {
  constructor() {
    // Track pressed keys
    this.keys = {};
    
    // Track mouse state
    this.mouse = {
      position: { x: 0, y: 0 },
      buttons: {},
      wheel: 0
    };
    
    // Bind event handlers
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    
    // Register event listeners
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('wheel', this._onWheel);
  }
  
  _onKeyDown(event) {
    this.keys[event.code] = true;
  }
  
  _onKeyUp(event) {
    this.keys[event.code] = false;
  }
  
  _onMouseMove(event) {
    this.mouse.position.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.position.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  _onMouseDown(event) {
    this.mouse.buttons[event.button] = true;
  }
  
  _onMouseUp(event) {
    this.mouse.buttons[event.button] = false;
  }
  
  _onWheel(event) {
    this.mouse.wheel = Math.sign(event.deltaY);
  }
  
  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  }
  
  isMouseButtonPressed(button) {
    return !!this.mouse.buttons[button];
  }
  
  getMousePosition() {
    return { ...this.mouse.position };
  }
  
  getMouseWheel() {
    const wheel = this.mouse.wheel;
    // Reset wheel after reading
    this.mouse.wheel = 0;
    return wheel;
  }
  
  dispose() {
    // Remove event listeners
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('wheel', this._onWheel);
  }
} 
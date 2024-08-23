

const WINDOW_WIDTH  = canvasID.width;
const WINDOW_HEIGHT = canvasID.height;
const WINDOW_MIDX   = WINDOW_WIDTH  * ONE_HALF;
const WINDOW_MIDY   = WINDOW_HEIGHT * ONE_HALF;

const CAMERA_FACING_THRESHOLD = 0.0;


//------------------
function Camera()
{	
    "use strict";

    let START_TIME  = 0.0;
    let MAX_SPIN    = 0.2;
    let SPIN_INC    = 0.01;
	let SCALE       = 300.0;
    let PERSPECTIVE = 0.0;//0.1;
	
	let _spin           = ZERO;
    let _rotatedX       = ZERO;
    let _rotatedZ       = ZERO;
    let _rotationSin    = ZERO;
    let _rotationCos    = ZERO;
    let _projected      = new Vector2D();
    
    
	//--------------------------------
	this.update = function( seconds )
	{
	    let radian = ZERO;
	    
	    if ( seconds > START_TIME )
	    {
    	    _spin += SPIN_INC;
	    
	        if ( _spin > MAX_SPIN )
	        {
	            _spin = MAX_SPIN;
	        }
	        
	        radian = ( seconds - START_TIME ) * _spin
	    }
	    
        _rotationSin = Math.sin( radian );
        _rotationCos = Math.cos( radian );  
    }


	//----------------------------
	this.getRotatedX = function()
	{
        return _rotatedX;  
    }
        
	//----------------------------
	this.getRotatedZ = function()
	{
        return _rotatedZ;  
    }

}




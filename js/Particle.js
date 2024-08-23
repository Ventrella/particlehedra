"use strict";

const MAX_PARTICLES	= 500;

const CENTER_MODE_ATTRACTION = 0;
const CENTER_MODE_LIMIT 	 = 1;
const CENTER_MODE_SPHERE 	 = 2;

//---------------------------------
// physics
//---------------------------------
const INERTIA	=  0.97;  
const JITTER	=  0.00001;

function Particle()
{
	this.position 		= new Vector3D();
	this.velocity 		= new Vector3D();
	this.speciesID		= NULL_INDEX;
	this.radius 		= 0.03;	
	this.attractionForce	= 0.02;
	let _vectorUtility	= new Vector3D();
	let _centerMode		= CENTER_MODE_ATTRACTION;
	let _rampUp 		= ZERO;
	
	this.configure = function( position, velocity )
	{
		this.position.copyFrom( position );
		this.velocity.copyFrom( velocity );
	}

	this.update = function( _particles, numParticles, rampUp )
	{
		_rampUp = rampUp;
		
		//--------------------------------------------------------------------
		// jitter
		//--------------------------------------------------------------------
		this.velocity.x += ( -JITTER * ONE_HALF + Math.random() * JITTER );
		this.velocity.y += ( -JITTER * ONE_HALF + Math.random() * JITTER );
		this.velocity.z += ( -JITTER * ONE_HALF + Math.random() * JITTER );
		
		//--------------------------------
		// friction
		//--------------------------------
		this.velocity.scale( INERTIA );
		
		//------------------------------------
		// update position by velocity
		//------------------------------------	
		this.position.add( this.velocity );		
		
		this.updateCentralizingForce();
	}
	
	//----------------------------------------
	this.updateCentralizingForce = function()
	{
		_vectorUtility.copyFrom( this.position );
		let dist = _vectorUtility.getMagnitude();
	
		//------------------------------------------------
		// attracted to center, no sphere-related forces
		//------------------------------------------------
		if ( _centerMode === CENTER_MODE_ATTRACTION )
		{
			let force = -this.attractionForce * _rampUp;
		
			this.velocity.addScaled( this.position, force );
		}
		//------------------------------------------------
		// stick to sphere
		//------------------------------------------------
		else if ( _centerMode === CENTER_MODE_SPHERE )
		{
			if ( dist > ZERO )
			{
				_vectorUtility.scale( ONE / dist );
				this.position.clear();
				this.position.addScaled( _vectorUtility, 1 - this.radius );
			}	
		}			
	
		//------------------------------------------------
		// cannot escape interior of sphere
		//------------------------------------------------
		else if ( _centerMode === CENTER_MODE_LIMIT )
		{
			if ( dist > 1 - this.radius )
			{
				if ( dist > ZERO )
				{
					_vectorUtility.scale( ONE / dist );					
					this.position.clear();
					this.position.addScaled( _vectorUtility, 1 - this.radius );
				}
			}
		}
	}
}
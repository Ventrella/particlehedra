"use strict";

//----------------------
function App()
{
	const NUM_TET_VERTICES 		= 4;
	const NUM_OCT_VERTICES 		= 6;
	const NUM_CUBE_VERTICES 	= 8;
	const NUM_ICOS_VERTICES 	= 12;
	const NUM_DODEC_VERTICES	= 20;

	const NUM_TET_EDGES 	= 6;
	const NUM_OCT_EDGES 	= 12;
	const NUM_CUBE_EDGES 	= 12;
	const NUM_ICOS_EDGES	= 30;
	const NUM_DODEC_EDGES	= 30;
	
	const TETRAHEDRON				=  0;
	const OCTAHEDRON 				=  1;
	const ICOSAHEDRON 				=  2;
	
	const CUBE 						=  3;
	const DODECAHEDRON 				=  4;
	
	const CUBOCTAHEDRON				=  5;
	const ICOSADODECAHEDRON			=  6;
	
	const TRUNC_TETRAHEDRON			=  7;
	const TRUNC_CUBE				=  8;
	const TRUNC_OCTAHEDRON			=  9;
	const TRUNC_DODECAHEDRON		= 10;
	const TRUNC_ICOSAHEDRON			= 11;
	
	const TRUNC_CUBOCTAHEDRON		= 12;
	const TRUNC_ICOSADODEC			= 13;
	
	const RHOMBI_CUBOCTAHEDRON		= 14;
	const RHOMBI_ICOSADODEC			= 15;
	
	const RHOMBIC_DODECAHEDRON		= 16;
	const STELLATED_DOCECAHEDRON	= 17;
	const TRIACONTAHEDRON			= 18;
	const TRI_DIPYRAMID				= 19;
	const GEODESIC					= 20;
	
	//---------------------------------
	// force maxima....
	//---------------------------------	
	const MAX_REPEL_FORCE	= 0.1;
	const MAX_REPEL_RADIUS	= 2;
	
	//---------------------------------
	// logic, numbers....
	//---------------------------------	
    const MAX_SPECIES		= 5;
    const MAX_EDGES			= 1000;
    const MAX_FACES			= 1000;
    const MAX_TRIANGLES		= 2000;
	const MAX_FACE_EDGES	= 10;
	
	const LEFT_SIDE  = 0;
	const RIGHT_SIDE = 1;

	//---------------------------------------
	// animation, graphics
	//---------------------------------------	
	const DEFAULT_PERSPECTIVE		= 0.2;
    const MILLISECONDS_PER_UPDATE 	= 1;
    const CONTROL_WIDTH				= 480;
    const CALCULATION_RATE			= 100;
    const SORT_RATE					= 10;
    const MOTION_BLUR				= 0.8;//0.6;
    const SURFACE_NORMAL_LENGTH		= 0.3;
	const TRIANGLE_ALPHA			= 1.0;
  	const MOUSE_FORCE 				= 0.0001;
    const RENDER_CLIP_PLANE_1		= -1 * 0.6;
    const RENDER_CLIP_PLANE_2		=  1 * 0.6;
    const RENDER_NORMALS			= false;
    const RENDER_FORCE_RADII 		= false;
    const RENDER_EDGE_INDICES		= false;
    const RENDER_PARTICLE_INDICES	= false;
    const RENDER_PARTICLE_SPECIES	= false;
    const RENDER_TRIANGLE_INDICES	= false;
    const RENDER_TRIANGLE_CENTERS	= false;
    const RENDER_EDGE_DATA			= false;
    
	const SPECIES_COLOR_0	= "rgba(   0,    0,    0, 0.7 )";	// black
	const SPECIES_COLOR_1	= "rgba( 100,   80,  200, 0.7 )";	// blue
	const SPECIES_COLOR_2	= "rgba( 150,   70,   40, 0.7 )";	// red
	const SPECIES_COLOR_3	= "rgba(  60,  140,   20, 0.7 )";	// green
	const SPECIES_COLOR_4 	= "rgba( 180,  140,   40, 0.7 )";	// yellow

	const BACKGROUND_COLOR	= "rgba( 222, 222, 222, " + ( 1-MOTION_BLUR ) + " )";     
    
	//--------------------
	function Viewport()
	{    
		this.position = new Vector2D();
		this.size = ZERO;
    }
    
	//--------------------
	function Edge()
	{    
		this.v0 = NULL_INDEX; // index of particle
		this.v1 = NULL_INDEX; // index of particle
		this.f0 = NULL_INDEX; // index of left face
		this.f1 = NULL_INDEX; // index of right face
		this.midPoint  = new Vector3D();
		this.leftward  = new Vector3D();
		this.rightward = new Vector3D();		
    }
    
	//---------------
	function Face()
	{    
		this.num = 0;
    	this.v = new Array( MAX_FACE_EDGES );
    }
    
	//--------------------
	function Triangle()
	{    
		this.center = new Vector3D();
		this.normal = new Vector3D();
		this.normalOutwardness = 0.0;
		this.v0 = NULL_INDEX; //index of particle 0
		this.v1 = NULL_INDEX; //index of particle 1
		this.v2 = NULL_INDEX; //index of particle 2
		this.e0 = NULL_INDEX; //index of edge 0
		this.e1 = NULL_INDEX; //index of edge 1
		this.e2 = NULL_INDEX; //index of edge 2
    }

	//--------------------
	function Species()
	{	
		this.numParticles = 0;
		this.repelForce	 = new Array( MAX_SPECIES );
		this.repelRadius = new Array( MAX_SPECIES );
		this.color = "rgb( 100, 100, 100 )";
    }
    
    let _viewport			= new Viewport();
    let _species   			= new Array( MAX_SPECIES );
    let _particles 			= new Array( MAX_PARTICLES );
    let _edges	 			= new Array( MAX_EDGES );
    let _faces	 			= new Array( MAX_FACES );
    let _triangles	 		= new Array( MAX_TRIANGLES );
    let _prevParticlePos 	= new Vector3D( MAX_PARTICLES );
	let _vectorUtility 		= new Vector3D();
	let _vectorUtility2		= new Vector3D();
	let _projectedPoint		= new Vector2D();
	let _triangleArea		= ZERO;
	let _edgeLengthRange	= ZERO;
	let _xMid  				= ZERO;
	let _yMid  				= ZERO;
	let _scale 				= ZERO;
	let _vs    				= ZERO;
	let _rotationForce		= ZERO;
	let _rampUp				= ZERO;
	let _perspective		= DEFAULT_PERSPECTIVE;
	let _numSpecies			= 0;
    let _totalNumParticles	= 0;
    let _numEdges			= 0;
    let _numFaces			= 0;
    let _numTriangles		= 0;
    let _clock				= 0;
    
let newClock = 0;
    
    let _polyhedronID		= 0;
    let _keySpecies			= 0;
    let _mouseDown			= false;
    let _mousePos			= new Vector2D();
    let _mouseVel			= new Vector2D();

	let _demoMode				= false;
	let _rotating				= false;
	let _renderSphere			= false;
    let _renderParticles		= false;
    let _renderEdges			= false;
    let _renderTriangles		= false;
	let _renderTriangleEdges	= false;

	let _startEdges		= 0;
	let _startTriangles	= 0;
	let _endParticles	= 0;
	
	let _testTriangle = 0;
	let _testTriangleCentroid = new Vector3D();
	let _testTriangleParticle = new Vector3D();
	
	let _sphereImage = new Image();
    
	for (let s=0; s<MAX_SPECIES; s++)
	{
		_species[s] = new Species();
	}
    
	for (let p=0; p<MAX_PARTICLES; p++)
	{
		_particles[p] = new Particle();
	}
    
	for (let e=0; e<MAX_EDGES; e++)
	{
		_edges[e] = new Edge();
	}
    
	for (let f=0; f<MAX_FACES; f++)
	{
		_faces[f] = new Face();
	}
    
	for (let t=0; t<MAX_TRIANGLES; t++)
	{
		_triangles[t] = new Triangle();
	}
    
	//----------------------------
	this.initialize = function()
	{
		//_centerMode = CENTER_MODE_LIMIT;
		//_centerMode = CENTER_MODE_ATTRACTION;
		//_centerMode = CENTER_MODE_SPHERE;
		
		_rotationForce	= 0.00003;
		_startEdges		= 300;//600;
		_startTriangles	= 500;//1000;
		_endParticles	= 1200;
		
		_sphereImage.src = "images/sphere.png";
		
		//----------------------------------------
		// initialize viewport
		//----------------------------------------
		_viewport.position.setXY( ZERO, ZERO );
		_viewport.size = 4;
		
		this.setPolyhedron( TETRAHEDRON				);
		//this.setPolyhedron( OCTAHEDRON 				);
		//this.setPolyhedron( ICOSAHEDRON 			 	);
		//this.setPolyhedron( CUBE 					 	);
		//this.setPolyhedron( DODECAHEDRON 			 	);
		//this.setPolyhedron( CUBOCTAHEDRON			 	);
		//this.setPolyhedron( ICOSADODECAHEDRON		 	);
		//this.setPolyhedron( STELLATED_DOCECAHEDRON	);
		//this.setPolyhedron( TRUNC_TETRAHEDRON		 	);
		//this.setPolyhedron( TRUNC_CUBE				);
		//this.setPolyhedron( TRUNC_OCTAHEDRON		 	);
		//this.setPolyhedron( TRUNC_DODECAHEDRON		);
		//this.setPolyhedron( TRUNC_ICOSAHEDRON		 	);
		//this.setPolyhedron( TRUNC_CUBOCTAHEDRON		);
		//this.setPolyhedron( TRUNC_ICOSADODEC		 	);
		//this.setPolyhedron( RHOMBI_CUBOCTAHEDRON	 	);
		//this.setPolyhedron( RHOMBI_ICOSADODEC		 	);
		//this.setPolyhedron( RHOMBIC_DODECAHEDRON	 	);
		//this.setPolyhedron( TRIACONTAHEDRON			);
		//this.setPolyhedron( TRI_DIPYRAMID				);
		//this.setPolyhedron( GEODESIC					);
		
		
		_demoMode				= true;
		_renderSphere			= true;
		_renderParticles		= true;
		//_renderTriangleEdges	= true;
		_perspective 			= DEFAULT_PERSPECTIVE;
	
		//------------------------------------------
		// randomize particle positions
		//------------------------------------------
		//this.randomizeParticlePositions();
		this.throwParticles();
		
		//-----------------------------------------------------		
		// set inputs and slider values to middle values...
		//-----------------------------------------------------	
		let normalizedSliderValue = ONE_HALF;
		
		//----------------------------
		// do this now
		//----------------------------
		this.resize();

		//-----------------------------------------		
		// start animation thread...		
		//-----------------------------------------		
	    setTimeout( "app.update()", 1 );
	 }



	//-----------------------------------
	this.throwParticles = function()
	{	
		this.clearVelocities();        

		for (let i=0; i<_totalNumParticles; i++)
		{
			_particles[i].position.setXYZ( 3, -1, 0 );
			_particles[i].velocity.setXYZ( -0.1 * Math.random(), -0.02 * Math.random(), 0 );
		}
	}
	
	//-------------------------------------------
	this.randomizeParticlePositions = function()
	{				
		let radius = 0.01;
		
        this.clearVelocities();        

		for (let i=0; i<_totalNumParticles; i++)
		{
			_particles[i].position.setXYZ
			(
				-radius * ONE_HALF + Math.random() * radius,
				-radius * ONE_HALF + Math.random() * radius,
				-radius * ONE_HALF + Math.random() * radius
			);
				
			let distance = _particles[i].position.getMagnitude();
			if ( distance === 0 )
			{
				_particles[i].position.z = 1;
			}
			else
			{
				_particles[i].position.scale( 1 / distance);
			}
		}
    }
    
	//--------------------------------
	this.setPolyhedron = function(p)
    {    
 		_numEdges 		= 0;   
 		_numFaces 		= 0;   
 		_numTriangles 	= 0;   
 		_clock 			= 0;
		_keySpecies 	= 0;

    	//-------------------------------------------------
		// set defaults for all particles and species
    	//-------------------------------------------------
		for (let p=0; p<MAX_PARTICLES; p++)
		{
			_particles[p].speciesID = 0;
		}

		for (let s=0; s<MAX_SPECIES; s++)
		{
			_species[s].numParticles = 0;
			
			for (let o=0; o<MAX_SPECIES; o++)
			{
				_species[s].repelForce [o] = 0.0;
				_species[s].repelRadius[o] = 0;
			}
		}
		
		_totalNumParticles	= 0;
		_triangleArea 	= 2.0;
		_edgeLengthRange = 0.4;

		_demoMode				= true;
		_renderParticles		= true;
		_renderEdges			= false;
		_renderTriangles		= false;
		//_renderTriangleEdges	= true;
		_rotating				= true;
		
    	//-----------------------------------
    	// configure the particlehedra
    	//-----------------------------------
		if ( p === TETRAHEDRON )
		{	
			_species[0].numParticles = NUM_TET_VERTICES;
			_totalNumParticles = _species[0].numParticles;
			
			_numSpecies = 1;
			_triangleArea = 10;	

			_species[0].repelForce [0] = 0.4 * MAX_REPEL_FORCE;
			_species[0].repelRadius[0] = 1.0 * MAX_REPEL_RADIUS;
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		if ( p === TRI_DIPYRAMID )
		{
			_species[0].numParticles = 5;
			_totalNumParticles 	= _species[0].numParticles;
			
			_keySpecies = 0;
			_numSpecies = 1;
			_triangleArea = 2.5;	

			_species[0].repelForce [0] = 0.3 * MAX_REPEL_FORCE;	
			_species[0].repelRadius[0] = 1.0 * MAX_REPEL_RADIUS;	
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		if ( p === OCTAHEDRON )
		{
			_species[0].numParticles = NUM_OCT_VERTICES;
			_totalNumParticles 	= _species[0].numParticles;

			_numSpecies = 1;
			_keySpecies	= 0;
			_triangleArea = 1.8;	

			_species[0].repelForce [0] = 0.242 * MAX_REPEL_FORCE;	
			_species[0].repelRadius[0] = 1.0   * MAX_REPEL_RADIUS;
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === ICOSAHEDRON )
		{
			_species[0].numParticles = NUM_ICOS_VERTICES;
			_totalNumParticles 	= _species[0].numParticles;

			_numSpecies = 1;
			_keySpecies 	= 0;
			_triangleArea 	= 1.0;	

			_species[0].repelForce [0] = 0.107 * MAX_REPEL_FORCE;		
			_species[0].repelRadius[0] = 1.0   * MAX_REPEL_RADIUS;
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === CUBE )
		{
			_species[0].numParticles = NUM_OCT_VERTICES;
			_species[1].numParticles = NUM_CUBE_VERTICES;

			_totalNumParticles 	= _species[0].numParticles + _species[1].numParticles;
			_numSpecies 	= 2;
			_keySpecies 	= 1;	
			_triangleArea	= 2;	

			_species[0].repelForce [0] = 0.25 * MAX_REPEL_FORCE;		
			_species[0].repelRadius[0] = 1.0  * MAX_REPEL_RADIUS;

			_species[1].repelForce [0] = 0.09 * MAX_REPEL_FORCE;	
			_species[1].repelRadius[0] = 1.0  * MAX_REPEL_RADIUS;
			_species[1].repelForce [1] = 0.09 * MAX_REPEL_FORCE;
			_species[1].repelRadius[1] = 1.0  * MAX_REPEL_RADIUS;
			
			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === NUM_OCT_VERTICES ) { s++; }
				_particles[p].speciesID = s;
			}
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === DODECAHEDRON )
		{
			_species[0].numParticles = NUM_ICOS_VERTICES;
			_species[1].numParticles = NUM_DODEC_VERTICES;

			_totalNumParticles 	= _species[0].numParticles + _species[1].numParticles;
			_keySpecies = 1;
			_numSpecies = 2;
			_triangleArea = 0.5;

			_species[0].repelForce [0] 	= 0.1 * MAX_REPEL_FORCE;;		
			_species[0].repelRadius[0]  = 1.0 * MAX_REPEL_RADIUS;

			_species[1].repelForce [0] 	= 0.06 * MAX_REPEL_FORCE;		
			_species[1].repelRadius[0]  = 1.0  * MAX_REPEL_RADIUS;
			_species[1].repelForce [1] 	= 0.02 * MAX_REPEL_FORCE;	
			_species[1].repelRadius[1]  = 1.0  * MAX_REPEL_RADIUS;

			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{				
				if ( p === NUM_ICOS_VERTICES ) { s++; }
				_particles[p].speciesID = s;
			}
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === STELLATED_DOCECAHEDRON )
		{
		}		
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === ICOSADODECAHEDRON )
		{
			_species[0].numParticles = 1;
			_species[1].numParticles = NUM_ICOS_VERTICES;
			_species[2].numParticles = NUM_DODEC_VERTICES;
			_species[3].numParticles = NUM_ICOS_EDGES;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles
			+ _species[3].numParticles;
			
			_edgeLengthRange = 0.5;
			_numSpecies = 4;
			_keySpecies = 3;
			_triangleArea = 0.5;	
						
			_species[1].repelForce [1] 	= 0.01;		
			_species[1].repelRadius[1]  = 2;
			
			_species[2].repelForce [1] 	= 0.005;		
			_species[2].repelRadius[1]  = 2;
			_species[2].repelForce [2] 	= 0.003;		
			_species[2].repelRadius[2]  = 2;
					
			_species[3].repelForce [0] = 0.5933447975304624; 
			_species[3].repelRadius[0] = 1.0303315197147955; 
			
			_species[3].repelForce [1] = 0.009942755367159502;
			_species[3].repelRadius[1] = 0.6954523854489439; 
			
			_species[3].repelForce [2] = 0.002037953734169518;
			_species[3].repelRadius[2] = 0.40557131842879873; 
			
			_species[3].repelForce [3] = 0.012531898170945854;
			_species[3].repelRadius[3] = 0.6055767361001781;	
			
			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === 1  															) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES  										) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES 					) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES + NUM_DODEC_EDGES	) { s++; }
				
				_particles[p].speciesID = s;
			}				
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === CUBOCTAHEDRON )
		{
			_species[0].numParticles = NUM_OCT_VERTICES;
			_species[1].numParticles = NUM_CUBE_VERTICES;
			_species[2].numParticles = NUM_OCT_EDGES;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles;

			_keySpecies = 2;
			_numSpecies = 3;
			_triangleArea = 1;	

			_species[0].repelForce [0] = 0.025;		
			_species[0].repelRadius[0] = 2;
			
			_species[1].repelForce [0] = 0.007;		
			_species[1].repelRadius[0] = 2;
			_species[1].repelForce [1] = 0.01;		
			_species[1].repelRadius[1] = 2;
			
			_species[2].repelForce [0] = 0.0045;		
			_species[2].repelRadius[0] = 2;
			_species[2].repelForce [1] = 0.0045;		
			_species[2].repelRadius[1] = 2;
			_species[2].repelForce [2] = 0.0045;		
			_species[2].repelRadius[2] = 2;
			
			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === NUM_OCT_VERTICES  									) { s++; }
				if ( p === NUM_OCT_VERTICES + NUM_CUBE_VERTICES 				) { s++; }
				if ( p === NUM_OCT_VERTICES + NUM_CUBE_VERTICES + NUM_OCT_EDGES	) { s++; }
				
				_particles[p].speciesID = s;
			}				
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === TRUNC_CUBE )
		{		
			_species[0].numParticles = 1;
			_species[1].numParticles = NUM_OCT_VERTICES;
			_species[2].numParticles = NUM_CUBE_VERTICES;
			_species[3].numParticles = NUM_OCT_EDGES * 2;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles
			+ _species[3].numParticles;
		
			_numSpecies = 4;
			_keySpecies = 3;
			_triangleArea = 0.8;	

			_species[1].repelForce [1] = 0.025;		
			_species[1].repelRadius[1] = 2;

			_species[2].repelForce [1] = 0.01;		
			_species[2].repelRadius[1] = 2.0;
			_species[2].repelForce [2] = 0.01;		
			_species[2].repelRadius[2] = 2.0;
			
			_species[3].repelForce [0] = 0.07;		
			_species[3].repelRadius[0] = 1.2;

			_species[3].repelForce [1] = 0.02;		
			_species[3].repelRadius[1] = 0.9;

			_species[3].repelForce [2] = 0.002;		
			_species[3].repelRadius[2] = 1;

			_species[3].repelForce [3] = 0.005;		
			_species[3].repelRadius[3] = 2.0;


			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === 1				  											) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES  										) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES + NUM_CUBE_VERTICES						) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES + NUM_CUBE_VERTICES + NUM_OCT_EDGES * 2 ) { s++; }
				
				_particles[p].speciesID = s;
			}					
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === TRUNC_TETRAHEDRON )
		{		
			_species[0].numParticles = NUM_TET_VERTICES;
			_species[1].numParticles = NUM_TET_VERTICES;
			_species[2].numParticles = NUM_TET_EDGES * 2;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles;

			_numSpecies = 3;
			_keySpecies = 2;
			_triangleArea = 0.7;	
			_edgeLengthRange = 0.7;

			_species[0].repelForce [0] = 0.045;
			_species[0].repelRadius[0] = 2;
			
			_species[1].repelForce [0] = 0.015;
			_species[1].repelRadius[0] = 2;
			_species[1].repelForce [1] = 0.02;		
			_species[1].repelRadius[1] = 2;
			
			_species[2].repelForce [0] = 0.014;
			_species[2].repelRadius[0] = 2;
			_species[2].repelForce [1] = 0.002;		
			_species[2].repelRadius[1] = 2;
			_species[2].repelForce [2] = 0.005;		
			_species[2].repelRadius[2] = 2;
			
			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === NUM_TET_VERTICES  										) { s++; }
				if ( p === NUM_TET_VERTICES + NUM_TET_VERTICES 						) { s++; }
				if ( p === NUM_TET_VERTICES + NUM_TET_VERTICES + NUM_OCT_EDGES * 2 	) { s++; }
				
				_particles[p].speciesID = s;
			}	
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === TRUNC_OCTAHEDRON )
		{		
			_species[0].numParticles = 1;
			_species[1].numParticles = NUM_OCT_VERTICES;
			_species[2].numParticles = NUM_CUBE_VERTICES;
			_species[3].numParticles = NUM_OCT_EDGES * 2;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles
			+ _species[3].numParticles;

			_keySpecies = 3;
			_triangleArea = 0.8;	

			_species[1].repelForce [1] = 0.025;		
			_species[1].repelRadius[1] = 2;

			_species[2].repelForce [1] = 0.01;		
			_species[2].repelRadius[1] = 2.0;
			_species[2].repelForce [2] = 0.01;		
			_species[2].repelRadius[2] = 2.0;
			
			_species[3].repelForce [0] = 0.07;		
			_species[3].repelRadius[0] = 1.2;

			_species[3].repelForce [1] = 0.003;		
			_species[3].repelRadius[1] = 1;

			_species[3].repelForce [2] = 0.01;		
			_species[3].repelRadius[2] = 1;

			_species[3].repelForce [3] = 0.005;		
			_species[3].repelRadius[3] = 2.0;

			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === 1				  											) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES  										) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES + NUM_CUBE_VERTICES						) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES + NUM_CUBE_VERTICES + NUM_OCT_EDGES * 2 ) { s++; }
				
				_particles[p].speciesID = s;
			}	
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === TRUNC_DODECAHEDRON )
		{		
			_species[0].numParticles = 1;
			_species[1].numParticles = NUM_ICOS_VERTICES;
			_species[2].numParticles = NUM_DODEC_VERTICES;
			_species[3].numParticles = NUM_DODEC_EDGES * 2;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles
			+ _species[3].numParticles;

			_keySpecies = 3;
			_triangleArea = 0.2;	

			_species[1].repelForce [1] = 0.01;		
			_species[1].repelRadius[1] = 2;

			_species[2].repelForce [1] = 0.003;		
			_species[2].repelRadius[1] = 2.0;

			_species[2].repelForce [2] = 0.003;		
			_species[2].repelRadius[2] = 2.0;

			_species[3].repelForce [0] = 0.07;		
			_species[3].repelRadius[0] = 1.3;

			_species[3].repelForce [1] = 0.003;		
			_species[3].repelRadius[1] = 1.0;

			//_species[3].repelForce [2] = 0.003;		
			//_species[3].repelRadius[2] = 1.0;

			_species[3].repelForce [3] = 0.001;		
			_species[3].repelRadius[3] = 2.0;


			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === 1				  												) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES  											) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES						) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES + NUM_DODEC_EDGES * 2 ) { s++; }
				
				_particles[p].speciesID = s;
			}	
		}
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === TRUNC_ICOSAHEDRON )
		{		
			_species[0].numParticles = 1;
			_species[1].numParticles = NUM_ICOS_VERTICES;
			_species[2].numParticles = NUM_DODEC_VERTICES;
			_species[3].numParticles = NUM_DODEC_EDGES * 2;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles
			+ _species[3].numParticles;

			_keySpecies = 3;
			_triangleArea = 0.2;	

			_species[1].repelForce [1] = 0.01;		
			_species[1].repelRadius[1] = 2;

			_species[2].repelForce [1] = 0.003;		
			_species[2].repelRadius[1] = 2.0;

			_species[2].repelForce [2] = 0.003;		
			_species[2].repelRadius[2] = 2.0;




			_species[3].repelForce [0] = 0.07;		
			_species[3].repelRadius[0] = 1.2;

			_species[3].repelForce [1] = 0.002;		
			_species[3].repelRadius[1] = 1.0;

			_species[3].repelForce [2] = 0.004;		
			_species[3].repelRadius[2] = 1.2;

			_species[3].repelForce [3] = 0.001;		
			_species[3].repelRadius[3] = 1.0;


			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === 1				  												) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES  											) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES						) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES + NUM_DODEC_EDGES * 2 ) { s++; }
				
				_particles[p].speciesID = s;
			}	
	    }
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === TRUNC_ICOSADODEC )
		{
		}
	    
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === GEODESIC )
		{
			_totalNumParticles = 73;
			_keySpecies = 1;
			_triangleArea = 0.3;	

			_species[0].repelForce [0] = 0.0;
			_species[0].repelRadius[0] = 0;
			
			_species[1].repelForce [0] = 0.03;		
			_species[1].repelRadius[0] = 1.9;

			_species[1].repelForce [1] = 0.002;		
			_species[1].repelRadius[1] = 1.3;

			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p >= 1 )
				{ 
					_particles[p].speciesID = 1; 
				}
			}
		}	    
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === RHOMBIC_DODECAHEDRON )
		{
			/*
			_totalNumParticles = 26;

			_species[0].edgeLengthLimit	= 0.0;
			_species[0].repelForce [0] = 0.025;		
			_species[0].repelRadius[0] = 2;
			_species[0].repelForce [1] = 0.0;		
			_species[0].repelRadius[1] = 2;
			_species[0].repelForce [2] = 0.0;	
			_species[0].repelRadius[2] = 2;
			
			_species[1].edgeLengthLimit	= 0.0;
			_species[1].repelForce [0] = 0.007;		
			_species[1].repelRadius[0] = 2;
			_species[1].repelForce [1] = 0.01;		
			_species[1].repelRadius[1] = 2;
			_species[1].repelForce [2] = 0.0;		
			_species[1].repelRadius[2] = 2;
			
			_species[2].edgeLengthLimit	= 0.6;			
			_species[2].repelForce [0] = 0.005;		
			_species[2].repelRadius[0] = 2;
			_species[2].repelForce [1] = 0.005;		
			_species[2].repelRadius[1] = 2;
			_species[2].repelForce [2] = 0.005;		
			_species[2].repelRadius[2] = 2;
			
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p >= 6 )
				{ 
					if ( p >= 14 )
					{
						_particles[p].speciesID = 2; 
					}
					else
					{
						_particles[p].speciesID = 1; 
					}
				}
			}	
			*/
			
			
			_totalNumParticles = 14;

			_species[0].repelForce [0] = 0.013;		
			_species[0].repelRadius[0] = 2;
			_species[0].repelForce [1] = 0.0;		
			_species[0].repelRadius[1] = 2;

			_species[1].repelForce [0] = 0.003;		
			_species[1].repelRadius[0] = 2;
			_species[1].repelForce [1] = 0.007;		
			_species[1].repelRadius[1] = 2;
			
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p >= 6 )
				{ 
					_particles[p].speciesID = 1; 
				}
			}
	    }
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === RHOMBI_CUBOCTAHEDRON )
		{
			_species[0].numParticles = 1;
			_species[1].numParticles = NUM_OCT_VERTICES;
			_species[2].numParticles = NUM_CUBE_VERTICES;
			_species[3].numParticles = NUM_OCT_EDGES * 3;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles
			+ _species[3].numParticles;

			_keySpecies = 4;
			_triangleArea = 0.4;	

			_species[1].repelForce [1] = 0.025;		
			_species[1].repelRadius[1] = 2;
			
			_species[2].repelForce [1] = 0.007;		
			_species[2].repelRadius[1] = 2;
			_species[2].repelForce [2] = 0.01;		
			_species[2].repelRadius[2] = 2;
			
			_species[3].repelForce [1] = 0.005;		
			_species[3].repelRadius[1] = 2;
			_species[3].repelForce [2] = 0.005;		
			_species[3].repelRadius[2] = 2;
			_species[3].repelForce [3] = 0.005;		
			_species[3].repelRadius[3] = 2;


			_species[4].repelForce [0] = 0.08;		
			_species[4].repelRadius[0] = 1.2;
			
			_species[4].repelForce [1] = 0.01;		
			_species[4].repelRadius[1] = 0.6;
			
			_species[4].repelForce [2] = 0.01;		
			_species[4].repelRadius[2] = 0.6;
			
			_species[4].repelForce [3] = 0.005;		
			_species[4].repelRadius[3] = 0.6;
			
			_species[4].repelForce [4] = 0.008;		
			_species[4].repelRadius[4] = 1.0;
			
			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === 1				  															) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES  														) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES + NUM_CUBE_VERTICES 									) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES + NUM_CUBE_VERTICES + NUM_OCT_EDGES						) { s++; }
				if ( p === 1 + NUM_OCT_VERTICES + NUM_CUBE_VERTICES + NUM_OCT_EDGES + NUM_OCT_EDGES * 2	) { s++; }
				
				_particles[p].speciesID = s;
			}						
		}	    
		
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === RHOMBI_ICOSADODEC )
		{
			/*
			_species[0].numParticles = 1;
			_species[1].numParticles = NUM_ICOS_VERTICES;
			_species[2].numParticles = NUM_DODEC_VERTICES;
			_species[3].numParticles = NUM_ICOS_EDGES * 5;

			_totalNumParticles 	
			= _species[0].numParticles 
			+ _species[1].numParticles
			+ _species[2].numParticles
			+ _species[3].numParticles;

			//_totalNumParticles = 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES + NUM_ICOS_EDGES + NUM_ICOS_EDGES * 4;
			
			_edgeLengthRange = 0.2;
			_keySpecies = 4;
			_triangleArea = 0.4;	
						
			_species[1].repelForce [1] 	= 0.01;		
			_species[1].repelRadius[1]  = 2;
			
			_species[2].repelForce [1] 	= 0.005;		
			_species[2].repelRadius[1]  = 2;
			_species[2].repelForce [2] 	= 0.003;		
			_species[2].repelRadius[2]  = 2;
					
			_species[3].repelForce [0] = 0.5933447975304624; 
			_species[3].repelRadius[0] = 1.0303315197147955; 
			
			_species[3].repelForce [1] = 0.009942755367159502;
			_species[3].repelRadius[1] = 0.6954523854489439; 
			
			_species[3].repelForce [2] = 0.002037953734169518;
			_species[3].repelRadius[2] = 0.40557131842879873; 
			
			_species[3].repelForce [3] = 0.012531898170945854;
			_species[3].repelRadius[3] = 0.6055767361001781;	
			
			
			
			
			_species[4].repelForce [0] = 0.08;		
			_species[4].repelRadius[0] = 1.2;
			
			_species[4].repelForce [1] = 0.01;		
			_species[4].repelRadius[1] = 0.3;
			
			_species[4].repelForce [2] = 0.01;		
			_species[4].repelRadius[2] = 0.3;
			
			_species[4].repelForce [3] = 0.01;		
			_species[4].repelRadius[3] = 0.1;
			
			_species[4].repelForce [4] = 0.01;		
			_species[4].repelRadius[4] = 0.3;




			let w = 0.03;


			_species[4].repelForce [0] += ( -w * ONE_HALF + w * Math.random() );		
			_species[4].repelRadius[0] += ( -w * ONE_HALF + w * Math.random() );		
			
			_species[4].repelForce [1] += ( -w * ONE_HALF + w * Math.random() );		
			_species[4].repelRadius[1] += ( -w * ONE_HALF + w * Math.random() );		
			
			_species[4].repelForce [2] += ( -w * ONE_HALF + w * Math.random() );			
			_species[4].repelRadius[2] += ( -w * ONE_HALF + w * Math.random() );		
			
			_species[4].repelForce [3] += ( -w * ONE_HALF + w * Math.random() );				
			_species[4].repelRadius[3] += ( -w * ONE_HALF + w * Math.random() );		
			
			_species[4].repelForce [4] += ( -w * ONE_HALF + w * Math.random() );			
			_species[4].repelRadius[4] += ( -w * ONE_HALF + w * Math.random() );		
			
			
			
			let s = 0;
			for (let p=0; p<_totalNumParticles; p++)
			{
				if ( p === 1  																				) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES  															) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES 										) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES + NUM_ICOS_EDGES						) { s++; }
				if ( p === 1 + NUM_ICOS_VERTICES + NUM_DODEC_VERTICES + NUM_ICOS_EDGES + NUM_ICOS_EDGES * 4	) { s++; }
				
				_particles[p].speciesID = s;
			}	
			*/	
		}	    
		
		//----------------------------------------------------------------------------------------------------	    
		//----------------------------------------------------------------------------------------------------	    
		else if ( p === TRIACONTAHEDRON )
		{
			_totalNumParticles = 42;
			//_edgeLength = 0.6;	
			//_edgeBuffer = 0.1;
			_keySpecies = 0;
			_triangleArea = 0.3;	

			_species[0].repelForce [0] 	= 0.003;		
			_species[0].repelRadius[0]  = 2;
		}
		
		
		//---------------------------------------------------------------------------------
		// adjust UI accordingly...
		//---------------------------------------------------------------------------------
		if ( _keySpecies === 0 ) { document.getElementById( "radio0" ).checked = true; }
		if ( _keySpecies === 1 ) { document.getElementById( "radio1" ).checked = true; }
		if ( _keySpecies === 2 ) { document.getElementById( "radio2" ).checked = true; }
		if ( _keySpecies === 3 ) { document.getElementById( "radio3" ).checked = true; }
		if ( _keySpecies === 4 ) { document.getElementById( "radio4" ).checked = true; }
		
		document.getElementById( "num0Label" ).innerHTML = _species[0].numParticles;
		document.getElementById( "num1Label" ).innerHTML = _species[1].numParticles;
		document.getElementById( "num2Label" ).innerHTML = _species[2].numParticles;
		document.getElementById( "num3Label" ).innerHTML = _species[3].numParticles;

		this.setSliderNormalizedValue( "slider1",  _species[0].repelForce [0] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider2",  _species[0].repelRadius[0] / MAX_REPEL_RADIUS );

		this.setSliderNormalizedValue( "slider3",  _species[1].repelForce [0] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider4",  _species[1].repelRadius[0] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider5",  _species[1].repelForce [1] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider6",  _species[1].repelRadius[1] / MAX_REPEL_RADIUS );

		this.setSliderNormalizedValue( "slider7",  _species[2].repelForce [0] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider8",  _species[2].repelRadius[0] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider9",  _species[2].repelForce [1] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider10", _species[2].repelRadius[1] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider11", _species[2].repelForce [2] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider12", _species[2].repelRadius[2] / MAX_REPEL_RADIUS );

		this.setSliderNormalizedValue( "slider13", _species[3].repelForce [0] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider14", _species[3].repelRadius[0] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider15", _species[3].repelForce [1] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider16", _species[3].repelRadius[1] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider17", _species[3].repelForce [2] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider18", _species[3].repelRadius[2] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider19", _species[3].repelForce [3] / MAX_REPEL_FORCE  );
		this.setSliderNormalizedValue( "slider20", _species[3].repelRadius[3] / MAX_REPEL_RADIUS );
    }
    
	//------------------------
	this.resize = function()
    {
        //console.log( "resize" );    
        
		canvasID.width  = window.innerWidth  - 10;
		canvasID.height = window.innerHeight - 10;
		
		_xMid  = ( canvasID.width - CONTROL_WIDTH ) * ONE_HALF;
		_yMid  = canvasID.height * ONE_HALF;
		_scale = canvasID.height * ONE_HALF;
		_vs    = _viewport.size  * ONE_HALF
    }


	//------------------------
	this.nudge = function()
    {
    	let force = 0.02;
    	
		for (let i=0; i<_totalNumParticles; i++)
		{
			_particles[i].velocity.addXYZ
			(
				-force * ONE_HALF + Math.random() * force,
				-force * ONE_HALF + Math.random() * force,
				-force * ONE_HALF + Math.random() * force
			);
		}
    }
        
	//------------------------
	this.zap = function()
    {
		this.randomizeParticlePositions();
    }
        
	//------------------------
	this.update = function()
    {
		_clock ++;		

//let ttt = _particles[0].position.getDistanceTo( _particles[1].position );	
//console.log( ttt );		
		
		
		if ( _rampUp < ONE )
		{
			_rampUp += 0.0005;
			
			if ( _rampUp > ONE )
			{
				_rampUp = ONE;
			}
		}
			
		for (let p=0; p<_totalNumParticles; p++)
		{
			//-------------------------------------
			// scan through the other particles
			//-------------------------------------
			for (let o=0; o<_totalNumParticles; o++)
			{
//if ( o != this.id )
if ( o != p )
				{
					_vectorUtility.setToDifference( _particles[o].position, _particles[p].position );                

					let dist = _vectorUtility.getMagnitude();
			
					if ( dist > ZERO )
					{
						_vectorUtility.scale( ONE / dist );

						let mySpecies = _species[ _particles[p].speciesID ];	
				
						let force = ZERO;

						let repelRadius = mySpecies.repelRadius[ _particles[o].speciesID ];		

						if ( dist < repelRadius )
						{
							let repelForce  = mySpecies.repelForce [ _particles[o].speciesID ];		
							force = -repelForce + repelForce * ( dist / repelRadius )
					
							force *= _rampUp;												
						}

						_particles[p].velocity.addScaled( _vectorUtility, force );
					}
				}
			}    		
			
			_particles[p].update( _particles, _totalNumParticles, _rampUp );
			
			if ( _mouseDown )
			{
				let pushScale = ( _particles[p].position.z ) * MOUSE_FORCE;
				_particles[p].velocity.x -= _mouseVel.x * pushScale;
				_particles[p].velocity.y -= _mouseVel.y * pushScale;
				
				_rotating = false;
			}
			else
			{
				//-----------------------------------------------------
				// forces from planet rotation
				//-----------------------------------------------------
				if ( _rotating )
				{
					_particles[p].velocity.x += _particles[p].position.z * _rotationForce;
					_particles[p].velocity.z -= _particles[p].position.x * _rotationForce;
				}	
        	}
        }
        
		_mouseVel.x *= 0.9;        
		_mouseVel.y *= 0.9;        
		
		if ( _demoMode )
		{
			if ( _clock === _startEdges )
			{
				_renderEdges = true;
			}
			else if ( _clock === _startTriangles )
			{
				_renderTriangles = true;
				//_renderEdges = false;
			}
			/*
			else if ( _clock === _endParticles )
			{
				_renderParticles = false;
			}
			*/
		}
				
if ( _clock % CALCULATION_RATE === 0 )
//if ( _clock === 700 )
		{		
			if ( _renderEdges )
			{
				this.calculateEdges();
			}
	
			if ( _renderTriangles )
			{
				this.calculateFaces();
			}
		}
	
		this.updateTriangles();

		if ( _renderTriangles )
		{
			if ( _clock	% SORT_RATE === 0 )
			{
				this.sortTrianglesByViewDistance();
			}
		}
		
        this.render();
        
	    setTimeout( "app.update()", MILLISECONDS_PER_UPDATE );
    }

	//----------------------------------
	this.calculateEdges = function()
	{
		//---------------------------------------
		// first, find the shortest edge...
		//---------------------------------------
		let shortestDistance = 100.0;

		for (let p=0; p<_totalNumParticles; p++)
		{
			for (let o=p+1; o<_totalNumParticles; o++)
			{
				_vectorUtility.setToDifference( _particles[o].position, _particles[p].position );
				                
				let distance = _vectorUtility.getMagnitude();
				if ( distance < shortestDistance )
				{
					shortestDistance = distance;
				}
			}
		}
		
		//--------------------------------------------------
		// then, find the shortest cluster of edges...
		//--------------------------------------------------
		_numEdges = 0;
		for (let p=0; p<_totalNumParticles; p++)
		{
			for (let o=p+1; o<_totalNumParticles; o++)
			{
				_vectorUtility.setToDifference( _particles[o].position, _particles[p].position );
				                
				let distance = _vectorUtility.getMagnitude();
				if ( distance < shortestDistance + _edgeLengthRange )
				{					
					if (( _particles[p].speciesID === _keySpecies )
					&&  ( _particles[o].speciesID === _keySpecies ))
					{
						_edges[ _numEdges ].v0 = p;
						_edges[ _numEdges ].v1 = o;	
						
						_edges[ _numEdges ].midPoint.copyFrom( _particles[p].position );	
						_edges[ _numEdges ].midPoint.addScaled( _vectorUtility, ONE_HALF );	
						
						_edges[ _numEdges ].leftward.setToCross( _vectorUtility, _edges[ _numEdges ].midPoint );
						_edges[ _numEdges ].leftward.normalize();
						_edges[ _numEdges ].rightward.copyFrom( _edges[ _numEdges ].leftward );		
						_edges[ _numEdges ].rightward.scale( -ONE );							
											
						_numEdges ++;
					}
				}
			}
		}
	}
	
	//---------------------------------------------------
	this.triangleWithVertices = function( v0, v1, v2 )
	{
		for (let t=0; t<_numTriangles; t++)
		{
			if (( _triangles[t].v0 === v0 ) 
			&&  ( _triangles[t].v1 === v1 ) 
			&&  ( _triangles[t].v2 === v2 )) 
			{ 
				return t; 
			}
			if (( _triangles[t].v0 === v0 ) 
			&&  ( _triangles[t].v2 === v1 ) 
			&&  ( _triangles[t].v1 === v2 )) 
			{ 
				return t; 
			}
			if (( _triangles[t].v1 === v0 ) 
			&&  ( _triangles[t].v2 === v1 ) 
			&&  ( _triangles[t].v0 === v2 )) 
			{ 
				return t; 
			}
			if (( _triangles[t].v1 === v0 ) 
			&&  ( _triangles[t].v0 === v1 ) 
			&&  ( _triangles[t].v2 === v2 )) 
			{ 
				return t; 
			}
			if (( _triangles[t].v2 === v0 ) 
			&&  ( _triangles[t].v0 === v1 ) 
			&&  ( _triangles[t].v1 === v2 )) 
			{ 
				return t; 
			}
			if (( _triangles[t].v2 === v0 ) 
			&&  ( _triangles[t].v1 === v1 ) 
			&&  ( _triangles[t].v0 === v2 )) 
			{ 
				return t; 
			}
		}
		
		return NULL_INDEX;
	}
	
	//------------------------------------
	this.calculateFaces = function()
	{
		//console.log( "calculateFaces" );
		
		
this.calculateTriangles();
		
		
//this.quickHull();
		
		/*
		//------------------------------------
		//	scan all edges to find faces...
		//------------------------------------
		for (let e=0; e<_numEdges; e++)
		{
			//----------------------------------------------------------------------
			// if there is no face yet on either side, add one...
			//----------------------------------------------------------------------
			if ( _edges[e].f0 === NULL_INDEX ) { this.addFace( e, LEFT_SIDE  ); }
			if ( _edges[e].f1 === NULL_INDEX ) { this.addFace( e, RIGHT_SIDE ); }
		}
		*/
	}
	

	//------------------------------------
	this.calculateTriangles = function()
	{
		_numTriangles = 0;
		
    	for (let i = 0; i < _totalNumParticles - 2; i++) 
    	{
        	for (let j = i + 1; j < _totalNumParticles - 1; j++) 
        	{
            	for (let k = j + 1; k < _totalNumParticles; k++) 
            	{
            		if ( _numTriangles < MAX_TRIANGLES )
            		{
						if (( _particles[i].speciesID === _keySpecies )
						&&  ( _particles[j].speciesID === _keySpecies )
						&&  ( _particles[k].speciesID === _keySpecies ))
						{
							_triangles[ _numTriangles ].v0 = i;
							_triangles[ _numTriangles ].v1 = j;
							_triangles[ _numTriangles ].v2 = k;
						
							this.updateTriangleCenterAndNormal( _numTriangles );

							let area = this.calculateAreaOfTriangle( _numTriangles );
							if ( area < _triangleArea )
							{					
								if ( _triangles[ _numTriangles ].normalOutwardness > 0.1 )
								{
									_numTriangles ++;
								}
							}
						}
					}
				}
			}
		}
	}	
	
	/*
	//--------------------------------
	this.quickHull = function() 
	{
	    if ( _totalNumParticles < 4 )
	    {
	    	// Not enough points to form a hull
	    	console.log( "_totalNumParticles < 4" );
			return;
		}

		//---------------------------------------
		// Find extremal points (min x, max x)
		//---------------------------------------
		let minXParticle = _particles[0];
		let maxXParticle = _particles[0];
		
		for (let i=0; i<_totalNumParticles; i++) 
		{
			if ( _particles[i].position.x < minXParticle.position.x ) { minXParticle = _particles[i]; }
			if ( _particles[i].position.x > maxXParticle.position.x ) { maxXParticle = _particles[i]; }
		}
		
		//------------------------------------------------
		// Initial bisector plane between minX and maxX
		//------------------------------------------------
		let leftSet  = [];
		let rightSet = [];
		
		let normal = 
		{
			x: maxXParticle.position.x - minXParticle.position.x,
			y: maxXParticle.position.y - minXParticle.position.y,
			z: maxXParticle.position.z - minXParticle.position.z
		};
		
		for (let i = 0; i < points.length; i++) 
		{
			if ( pointIsAbovePlane( points[i], minX, normal ) ) 
			{
				rightSet.push(points[i]);
			} 
			else 
			{
				leftSet.push(points[i]);
			}
		}
	}
	*/
	
	
// convex hull code from ChatGPT:

/*
function quickHull(points) {
    // Find convex hull using the Quickhull algorithm
    if (points.length < 4) return []; // Not enough points to form a hull

    // Find extremal points (min x, max x)
    let minX = points[0], maxX = points[0];
    for (let i = 0; i < points.length; i++) {
        if (points[i].position.x < minX.position.x) minX = points[i];
        if (points[i].position.x > maxX.position.x) maxX = points[i];
    }

    // Initial bisector plane between minX and maxX
    let leftSet = [], rightSet = [];
    let normal = {
        x: maxX.position.x - minX.position.x,
        y: maxX.position.y - minX.position.y,
        z: maxX.position.z - minX.position.z
    };

    for (let i = 0; i < points.length; i++) {
        if (pointIsAbovePlane(points[i], minX, normal)) {
            rightSet.push(points[i]);
        } else {
            leftSet.push(points[i]);
        }
    }

    let hull = [];
    buildHull(hull, leftSet, minX, maxX);
    buildHull(hull, rightSet, maxX, minX);

    return hull; // This should be an array of triangles
}

function pointIsAbovePlane(point, referencePoint, normal) {
    // Calculate vector from reference point to the point in question
    let vec = {
        x: point.position.x - referencePoint.position.x,
        y: point.position.y - referencePoint.position.y,
        z: point.position.z - referencePoint.position.z
    };
    // Dot product to determine the side of the plane
    return (vec.x * normal.x + vec.y * normal.y + vec.z * normal.z) > 0;
}

function buildHull(hull, points, p1, p2) {
    // Recursively build hull; add faces to hull
    if (points.length === 0) return;

    // Find the point farthest from the line segment p1-p2
    // Implement finding farthest point and splitting set
}

// Example usage
let points = [
    { position: { x: 0, y: 0, z: 0 } },
    { position: { x: 1, y: 0, z: 0 } },
    { position: { x: 0, y: 1, z: 0 } },
    { position: { x: 0, y: 0, z: 1 } },
    { position: { x: 1, y: 1, z: 1 } }
];
let triangles = quickHull(points);
console.log(triangles);
*/

	
	
	
	
	
	
	
	
	
	
	//-----------------------------------
	this.addFace = function( e, side )
	{		
		let clockLimit = 2;
		
		newClock ++;

		if ( newClock < clockLimit ) 
		{
			console.log( "Let's add the next free face to side " + side + " of edge " + e + "..." );			
		}
		
		//if ( newClock < clockLimit ) console.log( "Add face " + _numFaces + " to side " + side + " of edge " + e + "..." );			

		//-------------------------
		// some prep...
		//-------------------------
		let base = NULL_INDEX; 
		let end  = NULL_INDEX; 

		if ( side === LEFT_SIDE )
		{
			base = _edges[e].v1; 
			end  = _edges[e].v0; 
			_edges[e].f0 = _numFaces;
		}
		else
		{
			base = _edges[e].v0; 
			end  = _edges[e].v1; 
			_edges[e].f1 = _numFaces;
		}
		
		//-------------------------------------------------------------------------
		// set initial values of this face...
		//-------------------------------------------------------------------------
		_faces[ _numFaces ].num = 2; // this will accumulate as we find new edges to add.
		_faces[ _numFaces ].v[0] = base;
		_faces[ _numFaces ].v[1] = end;
		
		//-----------------------------------------------------------------------------------------
		// find the edge that shares a vertex with the end of edge e that is the right-most...
		//-----------------------------------------------------------------------------------------
		let candidate 	= NULL_INDEX;
		let mostRight 	= -ONE;
		let nextVertex	= NULL_INDEX;

		for (let o=0; o<_numEdges; o++)
		{
			if ( o != e )
			{
				let foundConnectingEdge = false;
				
				if ( _edges[o].v0 === end )
				{
					foundConnectingEdge = true;
					nextVertex = _edges[o].v1;
				}
				else if ( _edges[o].v1 === end )
				{
					foundConnectingEdge = true;
					nextVertex = _edges[o].v0;
				}
				
				if ( foundConnectingEdge )
				{
					let rightness = 1;//_edges[e].rightward.cross .... ;
					( rightness > mostRight )
					{
						mostRight = rightness;
						candidate = o;
					}
				}
			}
		}
			
		if ( newClock < clockLimit ) console.log( " Okay, looks like edge " + candidate + " shares vertex " + end + " with edge " + e );
			
		if ( candidate === NULL_INDEX )
		{
			if ( newClock < clockLimit ) console.log( "candidate === NULL_INDEX!" );
		}
		else
		{
			if ( newClock < clockLimit ) console.log( "now let's start building the new face..." );

			_faces[ _numFaces ].v[2] = nextVertex;			
			_faces[ _numFaces ].num ++;
			
			if ( newClock < clockLimit ) 
			{
				let text = "So far, this face has " + _faces[ _numFaces ].num + " vertices, ";
				
				text += "and they are " + _faces[ _numFaces ].v[0] + ", " + _faces[ _numFaces ].v[1] + ", and " + _faces[ _numFaces ].v[2] + ".";
				console.log( text );
			}
			
			//----------------------------------------------
			// The face has been added. Let's increment...
			//----------------------------------------------
			_numFaces ++;
		}
	}
	
	
	//---------------------------------------------------------
	this.theseEdgesClaimedByTriangle = function( i, j, k )
	{
		for (let t=0; t<_numTriangles; t++)
		{
			if ( ( _triangles[t].e0 === i ) && ( _triangles[t].e1 === j )  && ( _triangles[t].e2 === k ) ) { return true; }
			if ( ( _triangles[t].e0 === i ) && ( _triangles[t].e1 === k )  && ( _triangles[t].e2 === j ) ) { return true; }

			if ( ( _triangles[t].e0 === j ) && ( _triangles[t].e1 === i )  && ( _triangles[t].e2 === k ) ) { return true; }
			if ( ( _triangles[t].e0 === j ) && ( _triangles[t].e1 === k )  && ( _triangles[t].e2 === i ) ) { return true; }
			
			if ( ( _triangles[t].e0 === k ) && ( _triangles[t].e1 === i )  && ( _triangles[t].e2 === j ) ) { return true; }
			if ( ( _triangles[t].e0 === k ) && ( _triangles[t].e1 === j )  && ( _triangles[t].e2 === i ) ) { return true; }
		}
				
		return false;
	}
	
	//---------------------------------
	this.updateTriangles = function()
	{
		for (let t=0; t<_numTriangles; t++)
		{
			this.updateTriangleCenterAndNormal(t);
		}
	}

	//---------------------------------
	this.updateTriangleCenterAndNormal = function(t)
	{
		_triangles[t].center.x  = _particles[ _triangles[t].v0 ].position.x;
		_triangles[t].center.x += _particles[ _triangles[t].v1 ].position.x;
		_triangles[t].center.x += _particles[ _triangles[t].v2 ].position.x;
		_triangles[t].center.x /= 3.0;

		_triangles[t].center.y  = _particles[ _triangles[t].v0 ].position.y;
		_triangles[t].center.y += _particles[ _triangles[t].v1 ].position.y;
		_triangles[t].center.y += _particles[ _triangles[t].v2 ].position.y;
		_triangles[t].center.y /= 3.0;
		
		_triangles[t].center.z  = _particles[ _triangles[t].v0 ].position.z;
		_triangles[t].center.z += _particles[ _triangles[t].v1 ].position.z;
		_triangles[t].center.z += _particles[ _triangles[t].v2 ].position.z;
		_triangles[t].center.z /= 3.0;
		
		this.calculateTriangleNormal(t);
	}

	//------------------------------------------
	this.calculateTriangleNormal = function(t)
	{
		_vectorUtility.setToDifference ( _particles[ _triangles[t].v1 ].position, _particles[ _triangles[t].v0 ].position );
		_vectorUtility2.setToDifference( _particles[ _triangles[t].v2 ].position, _particles[ _triangles[t].v0 ].position );
		
		_triangles[t].normal.setToCross( _vectorUtility, _vectorUtility2 );
		_triangles[t].normal.normalize();	
		
		_triangles[t].normalOutwardness = _triangles[t].center.dotWith( _triangles[t].normal );
		
		if ( _triangles[t].normalOutwardness < 0.0 )
		{
			_triangles[t].normal.scale( -1 );
			_triangles[t].normalOutwardness = _triangles[t].center.dotWith( _triangles[t].normal );
		}	
	}	
	
	//--------------------------------------------
	this.sortTrianglesByViewDistance = function()
	{
		let swapped = false;
		
		for ( let i=0; i<_numTriangles-1; i++ ) 
		{
			swapped = false;

			for (let j=0; j<_numTriangles-i-1; j++) 
			{
//if ( _triangles[j].center.z > _triangles[j+1].center.z ) 
if ( _triangles[j].center.z < _triangles[j+1].center.z ) 
				{
					this.swapTriangles( j, j+1 );
					swapped = true;
				}
			}
 
			// If no two elements were swapped by inner loop, then break
			if ( swapped == false )
			{
				break;
			}
		}



		/*
		let temp_center = new Vector3D();
		let temp_normal = new Vector3D();

for (let t=1; t<_numTriangles; t++)
//for (let t=1; t<2; t++)
		{
//if ( _triangles[t].center.z < _triangles[t-1].center.z )
			{
				temp_center.copyFrom( _triangles[t].center );
				temp_normal.copyFrom( _triangles[t].normal );
				let temp_v0 = _triangles[t].v0;
				let temp_v1 = _triangles[t].v1;
				let temp_v2 = _triangles[t].v2;
				let temp_e0 = _triangles[t].e0;
				let temp_e1 = _triangles[t].e1;
				let temp_e2 = _triangles[t].e2;
				
				_triangles[t-1].center.copyFrom( _triangles[t].center );
				_triangles[t-1].normal.copyFrom( _triangles[t].normal );
				_triangles[t-1].v0 		= _triangles[t].v0;
				_triangles[t-1].v1 		= _triangles[t].v1;
				_triangles[t-1].v2 		= _triangles[t].v2;
				_triangles[t-1].e0 		= _triangles[t].e0;
				_triangles[t-1].e1 		= _triangles[t].e1;
				_triangles[t-1].e2 		= _triangles[t].e2;

				_triangles[t].center.copyFrom( temp_center );
				_triangles[t].normal.copyFrom( temp_normal );
				_triangles[t].v0 		= temp_v0;
				_triangles[t].v1 		= temp_v1;
				_triangles[t].v2 		= temp_v2;
				_triangles[t].e0 		= temp_e0;
				_triangles[t].e1 		= temp_e1;
				_triangles[t].e2 		= temp_e2;				
			}
		}
		*/
	}
	
	

	//----------------------------------------
	this.swapTriangles = function( t0, t1 )
	{
		let temp_center = new Vector3D();
		let temp_normal = new Vector3D();

		temp_center.copyFrom( _triangles[t1].center );
		temp_normal.copyFrom( _triangles[t1].normal );
		
		let temp_v0 = _triangles[t1].v0;
		let temp_v1 = _triangles[t1].v1;
		let temp_v2 = _triangles[t1].v2;
		let temp_e0 = _triangles[t1].e0;
		let temp_e1 = _triangles[t1].e1;
		let temp_e2 = _triangles[t1].e2;
		
		_triangles[t1].center.copyFrom( _triangles[t0].center );
		_triangles[t1].normal.copyFrom( _triangles[t0].normal );
		_triangles[t1].v0 = _triangles[t0].v0;
		_triangles[t1].v1 = _triangles[t0].v1;
		_triangles[t1].v2 = _triangles[t0].v2;
		_triangles[t1].e0 = _triangles[t0].e0;
		_triangles[t1].e1 = _triangles[t0].e1;
		_triangles[t1].e2 = _triangles[t0].e2;

		_triangles[t0].center.copyFrom( temp_center );
		_triangles[t0].normal.copyFrom( temp_normal );
		_triangles[t0].v0 = temp_v0;
		_triangles[t0].v1 = temp_v1;
		_triangles[t0].v2 = temp_v2;
		_triangles[t0].e0 = temp_e0;
		_triangles[t0].e1 = temp_e1;
		_triangles[t0].e2 = temp_e2;				
		
	}
	
	//--------------------------------------------
	this.updateParticleInteractions = function(p)
	{
		//-------------------------------------
		// scan through the other particles
		//-------------------------------------
		for (let o=0; o<_totalNumParticles; o++)
		{
		    if ( o != p )
		    {
          		_vectorUtility.setToDifference( _particles[o].position, _particles[p].position );                

				let dist = _vectorUtility.getMagnitude();
				
				if ( dist > ZERO )
				{
					_vectorUtility.scale( ONE / dist );

					let mySpecies = _species[ _particles[p].speciesID ];	
					
					let force = ZERO;

					let repelRadius = mySpecies.repelRadius[ _particles[o].speciesID ];		

					if ( dist < repelRadius )
					{
						let repelForce  = mySpecies.repelForce [ _particles[o].speciesID ];		
						force = -repelForce + repelForce * ( dist / repelRadius )
						
						
force *= _rampUp;						
						
					}

					_particles[p].velocity.addScaled( _vectorUtility, force );
				}
			}
		}                
	}
	
	
	
	//--------------------------------------
    this.clearVelocities = function()
    {    
		for (let i=0; i<_totalNumParticles; i++)
		{
            _particles[i].velocity.clear();            
		}
    }	
    
    
	//----------------------------------------------------
	this.calculateAreaOfTriangle = function(t) 
	{
		//let v0 = new Vector3D();
		//let v1 = new Vector3D();
		
		//_vectorUtility.setToDifference( a, b );
		//v1.setToDifference( a, c );
		
		
		_vectorUtility.setToDifference ( _particles[ _triangles[t].v1 ].position, _particles[ _triangles[t].v0 ].position );
		_vectorUtility2.setToDifference( _particles[ _triangles[t].v2 ].position, _particles[ _triangles[t].v0 ].position );
		
		let cross = new Vector3D();
		
		cross.setToCross( _vectorUtility, _vectorUtility2 );
		
		let area = cross.getMagnitude();
				
		
		/*
		// Create vectors AB and AC
		let v0 = b;
		
		
		let AB = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
		let AC = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];

		// Compute the cross product of AB and AC
		let crossProd = crossProduct(AB, AC);
		
		
		_vectorUtility.setToCross( v0, v1 );
		

		// Calculate the magnitude of the cross product
		let area = vectorMagnitude(crossProd) / 2;
	    */

		return area;
	}
    

	//------------------------
	this.render = function()
    {
		canvas.fillStyle = BACKGROUND_COLOR;		
		canvas.fillRect( 0, 0, canvasID.width, canvasID.height );	

		//----------------------------------------------------------		
		// render the edges on the back side of the sphere		
		//----------------------------------------------------------
		if ( _renderEdges )
		{
			this.renderEdges(0);
		}
						
		//----------------------------------------------------------		
		// render the particles on the back side of the sphere		
		//----------------------------------------------------------
		if ( _renderParticles )
		{
			this.renderParticles(0);
		}

		//----------------------------------------		
		// render sphere		
		//----------------------------------------
		if ( _renderSphere )
		{
//this.renderSphere(); // back side of sphere
		}

		//--------------------------
		// render triangles...
		//--------------------------
		if ( _renderTriangles )
		{
		
			//console.log( "_numTriangles = " + _numTriangles );
		
			for (let t=0; t<_numTriangles; t++)
			{				
this.renderTriangle(t);	

/*
if ( t === _testTriangle )
{
				this.renderTriangle(t);

	canvas.strokeStyle = "rgba( 255, 0, 0, 0.8 )";
	canvas.beginPath();

	_vectorUtility.copyFrom( _testTriangleCentroid );
	this.project( _vectorUtility );
	canvas.moveTo( _projectedPoint.x, _projectedPoint.y );
					
	_vectorUtility.copyFrom( _testTriangleParticle );
	this.project( _vectorUtility );

	canvas.lineTo( _projectedPoint.x, _projectedPoint.y );
	canvas.stroke();								
	canvas.closePath();
}
*/

			}
		}

		//-----------------------------------------------
		// render connections between each pair...
		//-----------------------------------------------
		//if ( RENDER_CONNECTIONS )
		{
			//this.renderConnections();
		}		
		
		//----------------------------------------------------------		
		// render the edges on the front side of the sphere		
		//----------------------------------------------------------
		if ( _renderEdges )
		{
			this.renderEdges(1);
		}	
					
		//------------------------
		// render sphere...
		//------------------------
		if ( _renderSphere )
		{
			let radius  = 1 / _vs * _scale;	
			canvas.drawImage( _sphereImage, _xMid - radius, _yMid - radius, radius * 2, radius * 2 );
		}

		//----------------------------------------------------------		
		// render the particles on the front side of the sphere		
		//----------------------------------------------------------
		if ( _renderParticles )
		{
			this.renderParticles(1); 
		}		
	}
		
	//------------------------------
	this.renderSphere = function()
    {        	
		let vx = ( 0 - _viewport.position.x ) / _vs;
		let vy = ( 0 - _viewport.position.y ) / _vs;

		let x = _xMid + vx * _scale;
		let y = _yMid + vy * _scale;

		let radius  = 1 / _vs * _scale;	
					
		canvas.fillStyle   = "rgba( 50, 80, 120, 0.1 )";        		
		canvas.strokeStyle = "rgba( 0, 0, 0, 0.1 )";        		

		canvas.beginPath();
		canvas.arc( x, y, radius, 0, Math.PI*2, false );
		canvas.fill();	  
		canvas.stroke();	  
	}	

	//---------------------------------------
	this.renderParticles = function( side )
	{        	
		for (let p=0; p<_totalNumParticles; p++)
		{
			if ( side === 0 )
			{
				if ( _particles[p].position.z > -0.01 )
				{
					this.renderParticle(p);			
				}
			}
			else
			{
				if ( _particles[p].position.z < -0.01 )
				{
					this.renderParticle(p);			
				}
			}
		}		
	}



	//--------------------------------
	this.renderParticle = function(p)
	{
		let s = _particles[p].speciesID;

		// keep this around in case I use big bubble versions
		/*
		let alpha = ONE;
		if ( _particles[p].position.z < RENDER_CLIP_PLANE_2 )
		{
			alpha = ( _particles[p].position.z - RENDER_CLIP_PLANE_1 ) / ( RENDER_CLIP_PLANE_2 - RENDER_CLIP_PLANE_1 );
		}
	
		alpha *= 0.6;			
		
		let limit = 0.1;
		if ( alpha < limit ) 
		{
			alpha = limit;
		}
		*/
		
		this.project( _particles[p].position );
		
		//let r = PARTICLE_RADIUS;
		
		/*
		if ( _particles[p].speciesID == 0 ) { r *= 10.0; }
		if ( _particles[p].speciesID == 1 ) { r *= 12.0; }
		if ( _particles[p].speciesID == 2 ) { r *= 10.0; }
		if ( _particles[p].speciesID == 3 ) { r *= 0.0; }
		if ( _particles[p].speciesID == 4 ) { r *= 10.0; }
		*/
		let radius  = _particles[p].radius / _vs * _scale;		
	
			 if ( _particles[p].speciesID === 0 ) { canvas.fillStyle = SPECIES_COLOR_0; canvas.strokeStyle = SPECIES_COLOR_0; }
		else if ( _particles[p].speciesID === 1 ) { canvas.fillStyle = SPECIES_COLOR_1; canvas.strokeStyle = SPECIES_COLOR_1; }
		else if ( _particles[p].speciesID === 2 ) { canvas.fillStyle = SPECIES_COLOR_2; canvas.strokeStyle = SPECIES_COLOR_2; }
		else if ( _particles[p].speciesID === 3 ) { canvas.fillStyle = SPECIES_COLOR_3; canvas.strokeStyle = SPECIES_COLOR_3; }
		else if ( _particles[p].speciesID === 4 ) { canvas.fillStyle = SPECIES_COLOR_4; canvas.strokeStyle = SPECIES_COLOR_4; }

		canvas.beginPath();
		canvas.arc( _projectedPoint.x, _projectedPoint.y, radius, 0, Math.PI*2, false );
		canvas.fill();	  

		// highlight
		canvas.beginPath();
		canvas.fillStyle = "rgba( 255, 255, 255, 0.4 )";
		canvas.arc( _projectedPoint.x + radius * 0.3, _projectedPoint.y - radius * 0.3, radius * 0.5, 0, Math.PI*2, false );
		canvas.fill();	  
		
/*		
// test for drawing motion-blur effect...		
		
canvas.lineWidth = radius;

canvas.beginPath();

this.project( _particles[p].position );
canvas.moveTo( _projectedPoint.x, _projectedPoint.y );

this.project( _prevParticlePos[p] );
canvas.lineTo( _projectedPoint.x, _projectedPoint.y );

_prevParticlePos[p].copyFrom( _particles[p].position );

canvas.stroke();	
*/
		
	
		if ( RENDER_PARTICLE_INDICES )
		{
			canvas.fillStyle = "rgba( 0, 0, 0, 0.5 )";
			canvas.font = "20px Ariel";
			canvas.fillText( p.toString(), _projectedPoint.x, _projectedPoint.y );	
		}
		
		if ( RENDER_PARTICLE_SPECIES )
		{
			canvas.fillStyle = "rgba( 0, 0, 0, 0.5 )";
			canvas.font = "20px Ariel";
			canvas.fillText( _particles[p].speciesID.toString(), _projectedPoint.x, _projectedPoint.y );	
		}
	
		//----------------------------------
		// show force radii				
		//----------------------------------
		if ( RENDER_FORCE_RADII )
		{
			canvas.strokeStyle = "rgba( 0, 0, 0, 0.1 )";    		
			canvas.beginPath();
			canvas.arc( x, y, _species[0].repelRadius[0] / _vs * _scale, 0, Math.PI*2, false );
			canvas.stroke();	
		}
	}
	
	
	
	/*
	//---------------------------------------
	this.renderConnections = function()
	{        	
		let _numConnections = 0;
	
		for (let p=0; p<_totalNumParticles; p++)
		{
			if ( _particles[p].speciesID === _keySpecies )
			{
				for (let o=p+1; o<_totalNumParticles; o++)
				{	
					if ( _particles[o].speciesID === _keySpecies )
					{
						_numConnections ++;
					
						canvas.strokeStyle = "rgba( 10, 6, 3, 0.2 )";
						canvas.lineWidth = 2;
	
						canvas.beginPath();

						let vx = ( _particles[p].position.x - _viewport.position.x ) / _vs;
						let vy = ( _particles[p].position.y - _viewport.position.y ) / _vs;

						let x1 = _xMid + vx * _scale;
						let y1 = _yMid + vy * _scale;

						canvas.moveTo( x1, y1 );

						vx = ( _particles[o].position.x - _viewport.position.x ) / _vs;
						vy = ( _particles[o].position.y - _viewport.position.y ) / _vs;

						let x2 = _xMid + vx * _scale;
						let y2 = _yMid + vy * _scale;

						canvas.lineTo( x2, y2 );
						canvas.stroke();	
					}
				}
			}
		}
		
		//console.log( "numConnections = " + _numConnections );
	}
	*/
	
	
	
	
	/*
	//---------------------------------------
	this.renderParticles = function( side )
	{        	
		for (let p=0; p<_totalNumParticles; p++)
		{
			if ( side === 0 )
			{
				if ( _particles[p].position.z > -0.01 )
				{
					this.renderParticle(p);			
				}
			}
			else
			{
				if ( _particles[p].position.z < -0.01 )
				{
					this.renderParticle(p);			
				}
			}
		}		
	}
	*/
	
	
	
	
	
	//--------------------------------------
	this.renderEdges = function( side )
	{        	
let threshold = -0.01;
	
		//console.log( "_numEdges = " + _numEdges ); 		

		for (let e=0; e<_numEdges; e++)
		{
//if ( _edges[e].id === 0 )
			{
				let midZ = _particles[ _edges[e].v0 ].position.z + ( _particles[ _edges[e].v1 ].position.z - _particles[ _edges[e].v0 ].position.z ) * ONE_HALF;
				if ( side === 0 )
				{
					if ( midZ > threshold )
					{
						this.renderEdge(e);
					}
				}
				else
				{
					if ( midZ < threshold )
					{
						this.renderEdge(e);
					}
				}
			}
		}
	}
	

	//------------------------------
	this.renderEdge = function(e)
    {        	
		canvas.strokeStyle = "rgba( 10, 6, 3, 0.2 )";
		canvas.lineWidth = 3;

		canvas.beginPath();

		this.project( _particles[ _edges[e].v0 ].position );
		canvas.moveTo( _projectedPoint.x, _projectedPoint.y );

		this.project( _particles[ _edges[e].v1 ].position );
		canvas.lineTo( _projectedPoint.x, _projectedPoint.y );

		canvas.stroke();	
		
		if ( RENDER_EDGE_DATA )
		{
			canvas.beginPath();
			canvas.fillStyle = "rgba( 0, 0, 0, 0.9 )";
			this.project( _edges[e].midPoint );
			canvas.arc( _projectedPoint.x, _projectedPoint.y, 3, 0, Math.PI*2, false );
			canvas.fill();	  
		
			let endPoint = new Vector3D();
		
			//--------------------------------------
			// show leftward...		
			//--------------------------------------
			endPoint.copyFrom( _edges[e].midPoint );
			endPoint.addScaled( _edges[e].leftward, 0.2 );

			canvas.strokeStyle = "rgba( 50, 100, 50, 0.7 )";
			canvas.beginPath();
		
			this.project( _edges[e].midPoint );
			canvas.moveTo( _projectedPoint.x, _projectedPoint.y );

			this.project( endPoint );
			canvas.lineTo( _projectedPoint.x, _projectedPoint.y );

			canvas.stroke();	

			canvas.fillStyle = "rgba( 0, 0, 0, 0.2 )";
			canvas.font = "20px Georgia";
			canvas.fillText( _edges[e].f0.toString(), _projectedPoint.x, _projectedPoint.y );						
	
			//--------------------------------------
			// show rightward...		
			//--------------------------------------
			endPoint.copyFrom( _edges[e].midPoint );
			endPoint.addScaled( _edges[e].rightward, 0.2 );

			canvas.strokeStyle = "rgba( 150, 50, 50, 0.7 )";
			canvas.beginPath();
		
			this.project( _edges[e].midPoint );
			canvas.moveTo( _projectedPoint.x, _projectedPoint.y );

			this.project( endPoint );
			canvas.lineTo( _projectedPoint.x, _projectedPoint.y );

			canvas.stroke();	

			canvas.fillStyle = "rgba( 0, 0, 0, 0.2 )";
			canvas.font = "20px Georgia";
			canvas.fillText( _edges[e].f1.toString(), _projectedPoint.x, _projectedPoint.y );						
		}
		
		if ( RENDER_EDGE_INDICES )
		{			
			this.project( _edges[e].midPoint );
			canvas.fillStyle = "rgba( 50, 90, 120, 0.4 )";
			canvas.font = "20px Georgia";
			canvas.fillText( e.toString(), _projectedPoint.x, _projectedPoint.y );						
		}	
    }
    
	//----------------------------------
	this.renderTriangle = function(t)
    {        	
		let shade = ONE_HALF - _triangles[t].normal.y * ONE_HALF;

		//console.log( shade );

		let red 	= Math.floor(  70 + shade * 165 );
		let green 	= Math.floor(  70 + shade * 155 );
		let blue	= Math.floor(  80 + shade * 135 );
		
		if ( _triangles[t].normal.z > 0.0 )
		{
			//red 	= Math.floor( 130 - shade * 40 );
			//green 	= Math.floor( 140 - shade * 40 );
			//blue	= Math.floor( 150 - shade * 40 );
			
			red 	= Math.floor( 160 - shade * 40 );
			green 	= Math.floor( 170 - shade * 40 );
			blue	= Math.floor( 180 - shade * 40 );
		}
		
		let alpha = TRIANGLE_ALPHA;
			
		canvas.fillStyle = "rgba( " + red + ", " + green + ", " + blue + ", " + alpha + " )";
		
		canvas.beginPath();
		
		this.project( _particles[ _triangles[t].v0 ].position );
		canvas.moveTo( _projectedPoint.x, _projectedPoint.y );		
		
		this.project( _particles[ _triangles[t].v1 ].position );
		canvas.lineTo( _projectedPoint.x, _projectedPoint.y );		

		this.project( _particles[ _triangles[t].v2 ].position );
		canvas.lineTo( _projectedPoint.x, _projectedPoint.y );		

		this.project( _particles[ _triangles[t].v0 ].position );
		canvas.lineTo( _projectedPoint.x, _projectedPoint.y );		

		canvas.closePath();
		canvas.fill();
		
		if ( _renderTriangleEdges )
		{
			canvas.lineWidth = 2;
			canvas.strokeStyle = "rgba( 0.0, 0.0, 0.0, 0.2 )";
			canvas.stroke();
		}
		
		//--------------------------------
		// render center...
		//--------------------------------
		if ( RENDER_TRIANGLE_CENTERS )
		{
			this.project( _triangles[t].center );
		
			canvas.fillStyle = "rgb( 0, 0, 0 )";    		
			canvas.beginPath();
			canvas.arc( _projectedPoint.x, _projectedPoint.y, 2.0, 0, Math.PI*2, false );
			canvas.fill();			
		
			if ( RENDER_TRIANGLE_INDICES )
			{
				canvas.fillStyle = "rgba( 50, 90, 120, 0.4 )";
				canvas.font = "20px Georgia";
				canvas.fillText( t.toString(), x, y );						
			}			
		}
		
		//-----------------------
		// render normal...
		//-----------------------
		if ( RENDER_NORMALS )
		{
			_vectorUtility.copyFrom( _triangles[t].center );
			_vectorUtility.addScaled( _triangles[t].normal, SURFACE_NORMAL_LENGTH );
		
			canvas.strokeStyle = "rgba( 0, 0, 100, 0.8 )";
			canvas.beginPath();
						
			this.project( _triangles[t].center );
			canvas.moveTo( _projectedPoint.x, _projectedPoint.y );

			this.project( _vectorUtility );
			canvas.lineTo( _projectedPoint.x, _projectedPoint.y );
			canvas.stroke();								
			canvas.closePath();
		}
	}

	//------------------------------------
	this.project = function( position )
	{
		let vx = ( position.x - _viewport.position.x ) / _vs;
		let vy = ( position.y - _viewport.position.y ) / _vs;
		
		let perspective = 1.0 - position.z * _perspective;

		_projectedPoint.x = _xMid + vx * _scale * perspective;
		_projectedPoint.y = _yMid + vy * _scale * perspective;
	}	
	
	
	//--------------------------------------------
	this.onRadioSelected = function( selection )
    {            	
    	//console.log( id );
    	if ( selection === "0" ) { _keySpecies = 0; this.recalculateGeometry(); }
    	if ( selection === "1" ) { _keySpecies = 1; this.recalculateGeometry(); }
    	if ( selection === "2" ) { _keySpecies = 2; this.recalculateGeometry(); }
    	if ( selection === "3" ) { _keySpecies = 3; this.recalculateGeometry(); }
    	if ( selection === "4" ) { _keySpecies = 4; this.recalculateGeometry(); }
    }
    
	//-------------------------------------
	this.recalculateGeometry = function()
    {
		this.calculateEdges();
		this.calculateFaces();
    }
    
	//-------------------------------------
	this.onButtonSelected = function( id )
    {            	
    	if ( id === "button1"  ) { this.setPolyhedron( TETRAHEDRON 			); this.startOver(); }
    	if ( id === "button2"  ) { this.setPolyhedron( TRUNC_TETRAHEDRON	); this.startOver(); }
    	if ( id === "button3"  ) { this.setPolyhedron( OCTAHEDRON  			); this.startOver(); }
    	if ( id === "button4"  ) { this.setPolyhedron( CUBE 				); this.startOver(); }    	
    	if ( id === "button5"  ) { this.setPolyhedron( TRUNC_OCTAHEDRON		); this.startOver(); }
    	if ( id === "button6"  ) { this.setPolyhedron( TRUNC_CUBE			); this.startOver(); }
    	if ( id === "button7"  ) { this.setPolyhedron( CUBOCTAHEDRON		); this.startOver(); }
    	if ( id === "button8"  ) { this.setPolyhedron( TRUNC_CUBOCTAHEDRON	); this.startOver(); }
    	if ( id === "button9"  ) { this.setPolyhedron( RHOMBI_CUBOCTAHEDRON	); this.startOver(); }
    	if ( id === "button10" ) { this.setPolyhedron( ICOSAHEDRON 			); this.startOver(); }  
    	if ( id === "button11" ) { this.setPolyhedron( DODECAHEDRON			); this.startOver(); }    	
    	if ( id === "button12" ) { this.setPolyhedron( TRUNC_ICOSAHEDRON	); this.startOver(); }
    	if ( id === "button13" ) { this.setPolyhedron( TRUNC_DODECAHEDRON	); this.startOver(); }
    	if ( id === "button14" ) { this.setPolyhedron( ICOSADODECAHEDRON	); this.startOver(); }    	
    	if ( id === "button15" ) { this.setPolyhedron( TRUNC_ICOSADODEC		); this.startOver(); }
    	if ( id === "button16" ) { this.setPolyhedron( RHOMBI_ICOSADODEC	); this.startOver(); }
    	if ( id === "button17" ) { this.setPolyhedron( RHOMBIC_DODECAHEDRON	); this.startOver(); }
    	if ( id === "button18" ) { this.setPolyhedron( TRIACONTAHEDRON		); this.startOver(); }
    	if ( id === "button19" ) { this.setPolyhedron( TRI_DIPYRAMID		); this.startOver(); }
    	

    	if ( id === "button20" ) 
    	{ 
			if ( _renderSphere ) 	{ _renderSphere = false; }
			else 					{ _renderSphere = true; }
    	}
    	
    	if ( id === "button21" ) 
    	{ 
    		_demoMode = false;

			if ( _renderParticles ) { _renderParticles = false; }
			else 					{ _renderParticles = true; }
    	}
    	
    	if ( id === "button22" ) 
    	{ 
    		_demoMode = false;

			if ( _renderEdges ) { _renderEdges = false; }
			else 				{ _renderEdges = true; }
    	}
    	
    	if ( id === "button23" ) 
    	{ 
    		_demoMode = false;

			if ( _renderTriangles ) { _renderTriangles = false; }
			else 					{ _renderTriangles = true; }
    	}
    	
    	if ( id === "button24" ) 
    	{ 
			if ( _renderTriangleEdges ) { _renderTriangleEdges = false; }
			else 						{ _renderTriangleEdges = true; }
    	}
    	
    	if ( id === "button25" ) 
    	{ 
    		if ( _perspective === 0.0 ) { _perspective = DEFAULT_PERSPECTIVE; }
    		else 						{ _perspective = 0.0; }
    	}

    	if ( id === "button26" ) 
    	{ 
    		if ( _rotating )	{ _rotating = false; }
    		else				{ _rotating = true; }
    	}
		
    	if ( id === "button27" ) 
    	{ 
			this.nudge();
		}
    	if ( id === "button28" ) 
    	{ 
			this.zap();
		}
    	if ( id === "button29" ) // clear
    	{ 
			this.clearAllParticles();
			_rotating = false;
		}
		
    	if ( id === "button30" ) { this.addParticle   (0); }
    	if ( id === "button31" ) { this.deleteParticle(0); }
    	if ( id === "button32" ) { this.addParticle   (1); }
    	if ( id === "button33" ) { this.deleteParticle(1); }
    	if ( id === "button34" ) { this.addParticle   (2); }
    	if ( id === "button35" ) { this.deleteParticle(2); }
    	if ( id === "button36" ) { this.addParticle   (3); }
    	if ( id === "button37" ) { this.deleteParticle(3); }
    	if ( id === "button38" ) { this.addParticle   (4); }
    	if ( id === "button39" ) { this.deleteParticle(4); }
    }

    //----------------------------------
	this.clearAllParticles = function()
    {
		_totalNumParticles	= 0;
		_numEdges 		= 0;   
		_numFaces 		= 0;   
		_numTriangles 	= 0;   
		_clock 			= 0;
		_keySpecies 	= 0;
		
		_demoMode				= false;
		_renderParticles		= true;
		_renderEdges			= false;
		_renderTriangles		= false;
		_renderTriangleEdges	= false;
		_rotating				= false;

		//-------------------------------------------------
		// set defaults for all particles and species
		//-------------------------------------------------
		for (let p=0; p<MAX_PARTICLES; p++)
		{
			_particles[p].speciesID = 0;
		}

		for (let s=0; s<MAX_SPECIES; s++)
		{
			for (let o=0; o<MAX_SPECIES; o++)
			{
				_species[s].numParticles = 0;
				
				if ( o <= s )
				{
					_species[s].repelForce [o] = MAX_REPEL_FORCE  * ONE_HALF;
					_species[s].repelRadius[o] = MAX_REPEL_RADIUS * ONE_HALF;
				}
				else
				{
					_species[s].repelForce [o] = 0.0;
					_species[s].repelRadius[o] = 0.0;
				}
			}
		}
		
		document.getElementById( "num0Label" ).innerHTML = 0;
		document.getElementById( "num1Label" ).innerHTML = 0;
		document.getElementById( "num2Label" ).innerHTML = 0;
		document.getElementById( "num3Label" ).innerHTML = 0;
		
		
		this.setSliderNormalizedValue( "slider1",  _species[0].repelForce [0] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider2",  _species[0].repelRadius[0] / MAX_REPEL_RADIUS );

		this.setSliderNormalizedValue( "slider3",  _species[1].repelForce [0] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider4",  _species[1].repelRadius[0] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider5",  _species[1].repelForce [1] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider6",  _species[1].repelRadius[1] / MAX_REPEL_RADIUS );

		this.setSliderNormalizedValue( "slider7",  _species[2].repelForce [0] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider8",  _species[2].repelRadius[0] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider9",  _species[2].repelForce [1] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider10", _species[2].repelRadius[1] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider11", _species[2].repelForce [2] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider12", _species[2].repelRadius[2] / MAX_REPEL_RADIUS );

		this.setSliderNormalizedValue( "slider13", _species[3].repelForce [0] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider14", _species[3].repelRadius[0] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider15", _species[3].repelForce [1] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider16", _species[3].repelRadius[1] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider17", _species[3].repelForce [2] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider18", _species[3].repelRadius[2] / MAX_REPEL_RADIUS );
		this.setSliderNormalizedValue( "slider19", _species[3].repelForce [3] / MAX_REPEL_FORCE );
		this.setSliderNormalizedValue( "slider20", _species[3].repelRadius[3] / MAX_REPEL_RADIUS );

		_totalNumParticles	= 0; 
		_triangleArea 	= 2.0;
		_edgeLengthRange = 0.4;

		_demoMode				= true;
		_renderParticles		= true;
		_renderEdges			= false;
		_renderTriangles		= false;
		//_renderTriangleEdges	= true;
		_rotating				= true;
	}

    //----------------------------------
	this.addParticle = function( s )
    {
		if ( _totalNumParticles < MAX_PARTICLES )
		{ 			

			let p = new Vector3D();
			let v = new Vector3D();

			p.setXYZ( 2, 0, 0.0 );
			
			let j = 0.1;
			v.setXYZ
			( 
				-j * ONE_HALF + Math.random() * j,
				-j * ONE_HALF + Math.random() * j,
				-j * ONE_HALF + Math.random() * j
			);

			_particles[ _totalNumParticles ].configure( p, v );
			_particles[ _totalNumParticles ].speciesID = s;
			_species[s].numParticles ++;
			_totalNumParticles ++;    	
			
			// put it in the html...
			document.getElementById( "num0Label" ).innerHTML = _species[0].numParticles;
			document.getElementById( "num1Label" ).innerHTML = _species[1].numParticles;
			document.getElementById( "num2Label" ).innerHTML = _species[2].numParticles;
			document.getElementById( "num3Label" ).innerHTML = _species[3].numParticles;
		}
	}
    
    //-----------------------------------
	this.deleteParticle = function( s )
    {
    	//-------------------------------------------------------------
    	// I gotta scan through the particles until I find one of 
    	// the right species, then kill it (shift all particles 
    	// higher in the array down), then decrement _totalNumParticles
    	//-------------------------------------------------------------
		if ( _totalNumParticles > 0 )
		//&&  ( _species[s].numParticles > 0 ))
		{
			let searching = true;
			let p = 0;
			
			while ( searching )
			{
				if ( _particles[p].speciesID === s )
				{
					// scroll back
					for (let o=p; o<_totalNumParticles; o++)
					{
						_particles[o].position.copyFrom( _particles[o+1].position );
						_particles[o].velocity.copyFrom( _particles[o+1].velocity );
						_particles[o].radius 		  =	 _particles[o+1].radius;
						_particles[o].attractionForce =  _particles[o+1].attractionForce;
						_particles[o].speciesID		  =  _particles[o+1].speciesID;
					}
					
					_species[s].numParticles --;
					_totalNumParticles --;
					searching = false;

					// put it in the html...
					document.getElementById( "num0Label" ).innerHTML = _species[0].numParticles;
					document.getElementById( "num1Label" ).innerHTML = _species[1].numParticles;
					document.getElementById( "num2Label" ).innerHTML = _species[2].numParticles;
					document.getElementById( "num3Label" ).innerHTML = _species[3].numParticles;
				}
				
				p ++;
				
				if ( p >= _totalNumParticles )
				{
					searching = false;
				}
			}				
		}
	}
    
    //------------------
	this.startOver = function()
    {
	    _clock = 0;
		_rampUp = 0;
		//this.randomizeParticlePositions();
		this.throwParticles();
    }
    	
	//-------------------------------------
	this.onSliderChanged = function( id )
    {        
    	let min = document.getElementById( id ).min;
    	let max = document.getElementById( id ).max;
    	let val = document.getElementById( id ).value;
    	
        let sliderValue = ( val - min ) / ( max - min );
        
        //console.log( "slider '" + id + "' changed: value = " + sliderValue );  
    
		if ( id === "slider1" ) { _species[0].repelForce [0] = sliderValue * 0.06; }	     
		if ( id === "slider2" ) { _species[0].repelRadius[0] = sliderValue * 2.0;  }

		if ( id === "slider3"  ) { _species[1].repelForce [0] = sliderValue * 0.06; }	     
		if ( id === "slider4"  ) { _species[1].repelRadius[0] = sliderValue * 2.0;  }		     
		if ( id === "slider5"  ) { _species[1].repelForce [1] = sliderValue * 0.06; }	     
		if ( id === "slider6"  ) { _species[1].repelRadius[1] = sliderValue * 2.0;  }		     

		if ( id === "slider7"  ) { _species[2].repelForce [0] = sliderValue * 0.06; }	     
		if ( id === "slider8"  ) { _species[2].repelRadius[0] = sliderValue * 2.0;  }		     
		if ( id === "slider9"  ) { _species[2].repelForce [1] = sliderValue * 0.06; }	     
		if ( id === "slider10" ) { _species[2].repelRadius[1] = sliderValue * 2.0;  }		    
		if ( id === "slider11" ) { _species[2].repelForce [2] = sliderValue * 0.06; }	     
		if ( id === "slider12" ) { _species[2].repelRadius[2] = sliderValue * 2.0;  }		     

		if ( id === "slider13" ) { _species[3].repelForce [0] = sliderValue * 0.06; }	     
		if ( id === "slider14" ) { _species[3].repelRadius[0] = sliderValue * 2.0;  }		     
		if ( id === "slider15" ) { _species[3].repelForce [1] = sliderValue * 0.06; }	     
		if ( id === "slider16" ) { _species[3].repelRadius[1] = sliderValue * 2.0;  }		    
		if ( id === "slider17" ) { _species[3].repelForce [2] = sliderValue * 0.06; }	     
		if ( id === "slider18" ) { _species[3].repelRadius[2] = sliderValue * 2.0;  }		     
		if ( id === "slider19" ) { _species[3].repelForce [3] = sliderValue * 0.06; }	     
		if ( id === "slider20" ) { _species[3].repelRadius[3] = sliderValue * 2.0;  }		     
    }
    
    /*
	//---------------------------------------------
	this.addToInputString = function( id, event )
    {
        //console.log( "addToInputString '" + id + "', event = " + event );
        
        //-------------------------------------------------
        // characters accumulate as the user types keys...
        //-------------------------------------------------
        let inputString = event.currentTarget.value;
        
        if ( event.key === 'Enter' )
        {	    
            let floatValue = parseFloat( inputString );
            //console.log( "ok: " + floatValue );
            
            //-------------------------------------
            // set the associated slider value...
            //-------------------------------------
            //let sliderFraction = ZERO;

            if ( id === "input1" ) { this.setSliderNormalizedValue( "slider1", floatValue ); }
            if ( id === "input2" ) { this.setSliderNormalizedValue( "slider2", floatValue ); }
            if ( id === "input3" ) { this.setSliderNormalizedValue( "slider3", floatValue ); }
        }
    }
    */

	//----------------------------------------------------------------------
	this.setSliderNormalizedValue = function( sliderID, normalizedValue )
    {            	
		let min = document.getElementById( sliderID ).min;
		let max = document.getElementById( sliderID ).max;
		
		let sliderValue = Math.floor( min + normalizedValue * ( max - min ) );

		//console.log( "sliderValue = " + sliderValue );
		
		if ( sliderID === "slider1" ) 
		{ 
			//_species[0].repelForce[0] = document.getElementById( "input1" ).value * 0.06;
		}

		if ( sliderID === "slider2" ) 
		{ 
			//_species[0].repelRadius[0] = document.getElementById( "input2" ).value * 2.0;
		}

		document.getElementById( sliderID ).value = sliderValue;
    }
    
	//---------------------------------
	this.mouseDown = function( x, y )
    {
    	_mouseDown = true;

    	_mousePos.x = x;
    	_mousePos.y = y;

     	_mouseVel.clear();    	
    }

	//--------------------------------
	this.mouseMove = function( x, y )
    {
    	_mouseVel.x = x - _mousePos.x;
    	_mouseVel.y = y - _mousePos.y;
    	
    	_mousePos.x = x;
    	_mousePos.y = y;
    }
    
	//------------------------------
	this.mouseUp = function( x, y )
    {
    	_mouseDown = false;
    	_mouseVel.clear();  
    }

	//--------------------------------
	this.mouseOut = function( x, y )
    {
    	_mouseDown = false;
    	_mouseVel.clear();    	
    }
}

//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmousedown = function(e) 
{
	app.mouseDown( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );  
}

//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmousemove = function(e) 
{
	app.mouseMove( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );  
}

//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmouseup = function(e) 
{
	app.mouseUp( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );  
}

//------------------------------------------------------------
document.getElementById( 'Canvas' ).onmouseout = function(e) 
{
	app.mouseOut( e.pageX - document.getElementById( 'Canvas' ).offsetLeft, e.pageY - document.getElementById( 'Canvas' ).offsetTop );  
}

//--------------------------------
// key down
//--------------------------------
document.onkeydown = function(e) 
{
    e = e || window.event;

	/*    
    if ( e.keyCode ===  37 ) { console.log( "left arrow key pressed" 	); } // left arrow key
    if ( e.keyCode ===  39 ) { console.log( "right arrow key pressed" 	); } // right arrow key
    if ( e.keyCode ===  38 ) { console.log( "up arrow key pressed" 		); } // up arrow key
    if ( e.keyCode ===  40 ) { console.log( "down arrow key pressed" 	); } // down arrow key
    if ( e.keyCode ===  61 ) { console.log( "plus key pressed" 			); } // plus key
    if ( e.keyCode === 173 ) { console.log( "minus key pressed" 		); } // minus key

    //apparently, Chrome and Safari  use different key codes...
    if ( e.keyCode === 187 ) { console.log( "plus key pressed" 			);	} // plus key
    if ( e.keyCode === 189 ) { console.log( "minus key pressed" 		);  } // minus key
    */
}

//------------------------------
document.onkeyup = function(e) 
{
    //console.log( "on key up" );
}

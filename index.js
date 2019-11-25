const GS = {
    ORIENTATION:{
        TOP: 1,
        RIGHT: 2,
        BOTTOM: 3,
        LEFT: 4
    },
    ROTATION:{
        CW: 1,
        CCW: -1
    },
    RELATION:{
        OVER: 1,
        TO_RIGHT: 2,
        UNDER: 3,
        TO_LEFT: 4        
    },
    ALIGN:{
        LEFT: -1,
        CENTER: 0,
        RIGHT: 1
    },
    VERTICAL_ALIGN:{
        TOP: -1,
        MIDDLE: 0,
        BOTTOM: 1        
    }
}

class Ui {
    constructor(params) {
        this._id = params.targetNodeId;
        this._host = params.host;
        this._orientation = params.orientation;
        this._alignment = params.alignment;
        this._vertical_alignment = params.verticalAlignment;
        this._rotation = params.rotation;
        this._sections = [];
        this._section_count = params.sectionCount;
        this._section_classes = params.sectionClasses;
        this._render_increment = params.renderIncrement;
        this._major_axis_max = params.majorAxisMax || 0;
        this._major_axis_min = params.majorAxisMin || 0;
        this._resize_throtle = params.resizeThrotle;
        this._throttled = false;
        this._host_dimensions = params.hostDimensions;
        this._major_axis = GoldenSection.calculateMajorAxis(this.hostDimensions, 
            this.orientation, 
            this.majorAxisMax, 
            this.majorAxisMin);

        window.addEventListener('resize', () => {this.resizeHandler()});
    }

    get alignment(){
        return this._alignment;
    }
    set alignment(val){
        this._alignment =  val;
    }    
    get host() {
        return this._host;
    }
    get hostDimensions() {
        return this._host_dimensions;
    } 
    set hostDimensions(obj) {
        this._host_dimensions = obj;
    }         
    get id() {
        return this._id;
    }
    get majorAxis(){
        return this._major_axis;
    }
    set majorAxis(val){
        this._major_axis = val;
    }     
    get majorAxisMax() {
        return this._major_axis_max;
    }
    get majorAxisMin() {
        return this._major_axis_min;
    } 
    get orientation() {
        return this._orientation;
    } 
    set orientation(val) {
        this._orientation = val;
    }     
    get renderIncrement(){
        return this._render_increment
    }              
    get resizeThrotle() {
        return this._resize_throtle;
    }       
    get rotation() {
        return this._rotation;
    }
    set rotation(val) {
        this._rotation = val;
    }    
    get sectionCount(){
        return this._section_count;
    }
    get sections(){
        return this._sections;
    }
    get sectionClasses(){
        return this._section_classes;
    }
    set sectionClasses(obj){
        this._section_classes = obj;
    } 
    get throttled(){
        return this._throttled;
    }
    set throttled(val){
        this._throttled = val;
    }          
    get verticalAlignment(){
        return this._vertical_alignment;
    } 
    set verticalAlignment(val){
        this._vertical_alignment = val;
    }     
    
    appendSection(section, timeout){
        this.sections.push(section);
        if(typeof timeout === 'undefined'|| timeout === 0){
            this.host.appendChild(section.element); 
        } else {
            setTimeout(()=> {
                this.host.appendChild(section.element); 
            }, timeout);
        }
    }

    getSectionClass(ix) {
        if (this.sectionClasses.length >= ix + 1){
            return this.sectionClasses[ix];
        } else if ((ix + 1) % this.sectionClasses.length === 0){
            return this.sectionClasses[this.sectionClasses.length - 1];
        } else {
            return this.sectionClasses[((ix + 1) % this.sectionClasses.length) - 1];
        }
    }

    resizeHandler() {
        if (!this.throttled) {
            this.transformUiSections();
            this.throttled = true;
            setTimeout(() => {
                this.throttled = false;
            }, this.resizeThrotle);
        }  
    }

    transformUiSections(transform_interval_constant = 0) {

        this.hostDimensions = GoldenSection.getHostDimensions(this.host);        
        this.majorAxis = GoldenSection.calculateMajorAxis(this.hostDimensions, 
            this.orientation, 
            this.majorAxisMax, 
            this.majorAxisMin);

        const base_node_division = GoldenSection.calculateMajorAxisDivisions(this.majorAxis);
        this.sections[0].coordinates = GoldenSection.calculateStartCoordinates(...base_node_division, this);
        this.sections[0].dimension = base_node_division[0];
        this.sections[0].sectionClass = this.getSectionClass(0);
        this.sections[0].transformSection();

        let section_dimension = base_node_division[1];
        let section_orientation = GoldenSection.indexOrientation(this.orientation, this.rotation, 2);

        let transform_interval = transform_interval_constant;

        for (let i = 1; i < this.sections.length; i++) {

            const sibling_section = this.sections[i - 1];
            const coordinates = GoldenSection.calculateSectionCoordinates(
                                        sibling_section.dimension, 
                                        section_dimension, 
                                        ...sibling_section.coordinates, 
                                        section_orientation,
                                        this.rotation); 

            this.sections[i].coordinates = coordinates
            this.sections[i].dimension = section_dimension;
            this.sections[i].sectionClass = this.getSectionClass(i);

            if(transform_interval_constant){
                _transformSectionOnDelay(this.sections[i], transform_interval);
                transform_interval += transform_interval_constant;
            } else {
                this.sections[i].transformSection();                                                    
            }
            section_dimension = sibling_section.dimension - section_dimension;
            section_orientation = GoldenSection.indexOrientation(section_orientation, this.rotation, 1);                
        } 
        
        function _transformSectionOnDelay(section, interval) {
            setTimeout(()=>{
                section.transformSection();
            }, interval);               
        }
    }

    transformUi(params){
        if (params.hasOwnProperty('orientation')){
            this.orientation = params.orientation;
        }
        if (params.hasOwnProperty('rotation')){
            this.rotation = params.rotation;
        } 
        if (params.hasOwnProperty('alignment')){
            this.alignment = params.alignment;
        } 
        if (params.hasOwnProperty('verticalAlignment')){
            this.verticalAlignment = params.verticalAlignment;
        } 

        if (params.hasOwnProperty('sectionClasses')){
            this.sectionClasses = params.sectionClasses;
            console.log(params.sectionClasses);
            
        }
        
        const transform_interval_constant =  params.transformInterval ? params.transformInterval : 0;
        
        this.transformUiSections(transform_interval_constant);
    }
}

class Section{

    constructor(params){
        this._id = params.id;
        this._coordinates = params.coordinates;
        this._dimension = params.dimension;
        this._section_class =  params.sectionClass;
        this._orientation =  params.orientation;
        this._element = document.createElement('div');

        this.element.id = this.id
        this.element.className = this.sectionClass
        this.element.setAttribute('style', `position:absolute; left:${this.coordinates[0]}px; top:${this.coordinates[1]}px; height:${this.dimension}px; width:${this.dimension}px; transition: all .5s ease-out;`);
    }
    get coordinates() {
        return this._coordinates;
    }  
    set coordinates(coor){
        this._coordinates = coor;
    }            
    get dimension() {
        return this._dimension;
    }
    set dimension(val) {
        this._dimension = val;
    } 
    get id() {
        return this._id;
    }              
    get element(){
        return this._element;
    }
    set element(node){
        this._element = node;
    } 
    get orientation(){
        return this._orientation;
    }
    set orientation(val){
        this._orientation = val;
    }        
    get sectionClass() {
        return this._section_class;
    }
    set sectionClass(val) {
        this._section_class = val;
    }

    addClass(cls) {
        this.element.className  = `${this.element.className} ${cls}`;
    } 
    
    appendContent(content) {

        if (typeof content === 'string'){
            this.element.appendChild(document.createTextNode(content));
        } else if (content instanceof Element) {
            this.element.appendChild(content);
        } else if (typeof content === 'object' && content.hasOwnProperty('element') && content.element instanceof Element) {
            this.element.appendChild(content.element);
        } else {
            console.log(`Unable to append this ${typeof content} as a child node`);
        } 
    }

    bindEvent(event, cb){
        this.element.addEventListener(event, function(evt){
            cb(evt);
        })
    }

    classReg(cls) {
        return new RegExp("(^|\\s+)" + cls + "(\\s+|$)");
    }

    clearContent(){
        while(this.element.firstChild){
            this.element.removeChild(this.element.firstChild) 
        }
    }

    hasClass(cls) {
        return this.classReg(cls).test(this.element.className);
    };

    removeClass(cls) {
        this.element.className = this.element.className.replace(this.classReg(cls), ' ');
    }

    transformSection(){
        this.setClass(this.sectionClass);
        this.element.setAttribute('style', `position:absolute; left:${this.coordinates[0]}px; top:${this.coordinates[1]}px; height:${this.dimension}px; width:${this.dimension}px; transition: all .5s ease-out;`);
    }

    setClass(cls) {
        this.element.className = cls;
    } 
    
    toggleClass(cls) {
        let fn = this.hasClass(cls) ? this.removeClass : this.addClass;
        fn(cls);
    }     

}

class GoldenSection{

    static get phi () {
        return 1.6180339887;
    }
 
    static calculateMajorAxis(host_dimensions, orientation, major_axis_max, major_axis_min) {

        let major_axis = 0;
        let minor_axis_max = 0;
        let node_dimenson = 0;

        switch (orientation) {
            case GS.ORIENTATION.LEFT:
            case GS.ORIENTATION.RIGHT:
                major_axis = node_dimenson = host_dimensions.width;
                minor_axis_max = host_dimensions.height;
                break;
            case GS.ORIENTATION.TOP:
            case GS.ORIENTATION.BOTTOM:
                major_axis = node_dimenson = host_dimensions.height;
                minor_axis_max = host_dimensions.width;
                break;
        }

        if (major_axis_max > 0 && node_dimenson > major_axis_max) {
            major_axis =  major_axis_max
        } else if (major_axis_min > 0 && node_dimenson < major_axis_min){
            major_axis =  major_axis_min
        } 

        if (Math.floor(major_axis / GoldenSection.phi) > minor_axis_max){
            major_axis =  Math.floor(minor_axis_max * GoldenSection.phi);
        }

        return major_axis > major_axis_min ? major_axis : major_axis_min;       
    }
    
    static calculateMajorAxisDivisions(major_axis){
        const a = Math.round(Math.round(major_axis * 1000 / GoldenSection.phi) / 1000);
        const b = major_axis - a;
        return [a, b];
    } 

    static calculateSectionCoordinates(a, b, x, y, orientation, rotation) {

        let coordinate_x = 0;
        let coordinate_y = 0;

        switch (orientation) {
            case GS.ORIENTATION.TOP:
                coordinate_x = rotation === GS.ROTATION.CW ? x : x + a - b;
                coordinate_y = y - b;
                break;
            case GS.ORIENTATION.RIGHT:
                coordinate_x = x + a;
                coordinate_y = rotation === GS.ROTATION.CW ? y : y + a - b;
                break;
            case GS.ORIENTATION.BOTTOM:
                coordinate_x = rotation === GS.ROTATION.CW ? x + a - b : x;
                coordinate_y = y + a;
                break;
            case GS.ORIENTATION.LEFT:
                coordinate_x = x - b;
                coordinate_y = rotation === GS.ROTATION.CW ? y + a - b : y;
                break;          
        }

        return [coordinate_x, coordinate_y];
    }    

    static calculateStartCoordinates(a, b, ui_node) {

        let offset_x = 0;
        let offset_y = 0;
        let x = 0;
        let y = 0; 
        
        const ui_dimensions = (ui_node.orientation === GS.ORIENTATION.TOP || 
            ui_node.orientation === GS.ORIENTATION.BOTTOM) ? {width: a, height: a + b} : {width: a + b , height: a};

        switch (ui_node.alignment) {
            case GS.ALIGN.CENTER:
                offset_x = Math.floor((ui_node.hostDimensions.width - ui_dimensions.width) / 2);                    
                break;
            case GS.ALIGN.RIGHT:
                offset_x = ui_node.hostDimensions.width - ui_dimensions.width;
            break;
        }

        switch (ui_node.verticalAlignment) {
            case GS.VERTICAL_ALIGN.MIDDLE:
                offset_y = Math.floor((ui_node.hostDimensions.height - ui_dimensions.height) / 2);
            break;
            case GS.VERTICAL_ALIGN.BOTTOM:
                offset_y = ui_node.hostDimensions.height - ui_dimensions.height;
            break;
        }        

        switch (ui_node.orientation) {
            case GS.ORIENTATION.TOP:
            case GS.ORIENTATION.LEFT:
                x = offset_x;
                y = offset_y;
                break;
            case GS.ORIENTATION.RIGHT:
                x = offset_x + b;
                y = offset_y;
                break;
            case GS.ORIENTATION.BOTTOM:
                x = offset_x
                y = offset_y + b;
                break;        
        }

        return [x, y];        
    }    

    static getHostDimensions(host) {
        return {width: host.offsetWidth, height: host.offsetHeight};
    }     

    static indexOrientation(previous_orientation, rotation, increments) {
        let orientation = previous_orientation;
        for (let i = 0; i < increments; i++){
            if (rotation === GS.ROTATION.CW){
                orientation = orientation === 4 ? 1 : orientation + 1;
            } else {
                orientation = orientation  === 1 ? 4 : orientation - 1;
            }
        }
        return orientation;
    }     
    
    constructor(){
        this._ui_nodes = {};       
    }

    get uiNodes() {
        return this._ui_nodes;
    }

    generate(params){

        if(!this.validateInputParameters(params)){return false;}
        params.host = document.getElementById(params.targetNodeId);
        params.hostDimensions = GoldenSection.getHostDimensions(params.host);
        this.initializeHost(params.host);
      
        const ui_node = new Ui(params);
        if (!ui_node.host){
            throw new Error('Unable to get refrence to the target element');
        }

        this.uiNodes[ui_node.id] = ui_node;
        
        const base_node_division = GoldenSection.calculateMajorAxisDivisions(ui_node.majorAxis); 

        const primary_section = new Section({
                coordinates: GoldenSection.calculateStartCoordinates(...base_node_division, ui_node),
                dimension: base_node_division[0],
                id: `${ui_node.id}-node-0`,
                orientation: ui_node.orientation,
                sectionClass: ui_node.getSectionClass(0)
            });
 
        ui_node.appendSection(primary_section, 0);
        let section_dimension = base_node_division[1];
        let section_orientation = GoldenSection.indexOrientation(primary_section.orientation, ui_node.rotation, 2);

        for (let i = 1; i < params.sectionCount; i++) {
            const sibling_section = ui_node.sections[i - 1];
            const coordinates = GoldenSection.calculateSectionCoordinates(
                                        sibling_section.dimension, 
                                        section_dimension, 
                                        ...sibling_section.coordinates, 
                                        section_orientation,
                                        ui_node.rotation);  
                                        
            ui_node.appendSection(new Section({
                coordinates: coordinates,
                dimension: section_dimension,
                id: `${ui_node.id}-node-${i}`,
                orientation: section_orientation,
                sectionClass: ui_node.getSectionClass(i)
                }), ui_node.renderIncrement * i);                                                    

            section_dimension = sibling_section.dimension - section_dimension;
            section_orientation = GoldenSection.indexOrientation(section_orientation, ui_node.rotation, 1);
        }
        return ui_node;
    }
   
    getUiNode(host_id) {
        return this.uiNodes[host_id];
    } 

    initializeHost(host) {
        const style = host.getAttribute('style');
        host.setAttribute('style', `${style ? style : ''} position:relative;`);
    }       
    
    removeUiNode(host_id){
        const ui_node = this.uiNodes[host_id]
        while(ui_node.sections.length){
            ui_node.sections[0].clearContent();
            ui_node.host.removeChild(ui_node.sections[0].element);
            ui_node.sections.splice(0, 1);
        }
        delete this.uiNodes[host_id];        
    }       

    validateInputParameters(params) {
        let is_valid = true;
        if(typeof params === 'undefined'){
            is_valid = false; 
            console.log(`Generation Error: a arguments object is required by the generate method.`);            
        }
        else if (typeof params.targetNodeId === 'undefined' || params.targetNodeId === ''){
            is_valid = false; 
            console.log(`Generation Error: a 'targetNodeId' is required by the generate method.`);
        } else {
            params.orientation = typeof params.orientation === 'undefined' ? GS.ORIENTATION.RIGHT : params.orientation;
            params.alignment = typeof params.alignment === 'undefined' ? GS.ALIGN.LEFT : params.alignment;
            params.verticalAlignment = typeof params.verticalAlignment === 'undefined' ? GS.VERTICAL_ALIGN.TOP : params.verticalAlignment;
            params.rotation = typeof params.rotation === 'undefined' ? GS.ROTATION.CCW : params.rotation;
            params.renderIncrement = typeof params.renderIncrement === 'undefined' ? 0: params.renderIncrement;
            params.resizeThrotle = typeof params.resizeThrotle === 'undefined' ? 15: params.resizeThrotle;
            if(typeof params.sectionCount === 'undefined' || params.sectionCount < 1){
                params.sectionCount = 6;
            } else {
                params.sectionCount = params.sectionCount > 8 ? 8 : params.sectionCount;
            }
            if (params.sectionClasses === 'undefined'){
                params.sectionClasses = ['wax-golden-section']  
            } else if (typeof params.sectionClasses === 'string') {
                params.sectionClasses = [params.sectionClasses] 
            } else if (!Array.isArray(params.sectionClasses)) {
                is_valid = false; 
                console.log(`Generation Error: an invalid sectionClasses argument was passed: ${JSON.stringify(params.sectionClasses)}`);                
            }
         }
        return is_valid;
    }

    printApi(){
      
        console.log(`
            ********************************************************
            ************ Web Atomix Golden-Section API *************

            Dynamically inject the Golden-Section layout into the DOM
            by calling goldenSection.generate({params}).

            Parameter Options:

                targetNodeId : REQUIRED, the parent node that will contain teh Golden-Section layout.
                orientation: Use a GS.ORIENTATION constant to determinte the postion on the largest section in relation to the other sections with the layout.  
                    It will also determine the direction of the long axis of the layout.
                alignment: Use a GS.ALIGN constant to determine how the layout is aligned horizontally within the containing element.
                verticalAlignment: Use a GS.VERTICAL_ALIGN constant to determine how the layout is aligned vertically within the containing element.
                rotation: Use a GS.ROTATION constant to determine the rotational direction of the layout.
                sectionCount: An integer value to determine the the number of sections to be rendered, the maximum is 8.
                renderIncrement: An optional millisecond setting that controls the rendering of the layout sections.
                sectionClasses: An array of one or more class names to be applied to the redered sections.  A class name is applied to a section in
                sequence to the sections being rendered.  If there are fewer class names in the array than layout sections, the generator will cycle 
                back through the array of class names, assigning them in sequence.
                majorAxisMax: An optional integer value that determines the maximum major-axis dimension of the golden-section layout.            
                majorAxisMin: An optional integer value that determines the minimum major-axis dimension of the golden-section layout. 
                resizeThrotle: An optional millisecond value that throttles the resize event. By default it's set to 15ms.

            ********************************************************
        `);
    }
}

const goldenSection = new GoldenSection();
export {goldenSection, GS};

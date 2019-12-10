(function () {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var GS = {
    ORIENTATION: {
      TOP: 1,
      RIGHT: 2,
      BOTTOM: 3,
      LEFT: 4
    },
    ROTATION: {
      CW: 1,
      CCW: -1
    },
    RELATION: {
      OVER: 1,
      TO_RIGHT: 2,
      UNDER: 3,
      TO_LEFT: 4
    },
    ALIGN: {
      LEFT: -1,
      CENTER: 0,
      RIGHT: 1
    },
    VERTICAL_ALIGN: {
      TOP: -1,
      MIDDLE: 0,
      BOTTOM: 1
    }
  };

  var GoldenSectionUi =
  /*#__PURE__*/
  function () {
    function GoldenSectionUi(params) {
      var _this = this;

      _classCallCheck(this, GoldenSectionUi);

      this._id = params.targetNodeId;
      this._host = params.host;
      this._orientation = params.orientation;
      this._alignment = params.alignment;
      this._vertical_alignment = params.verticalAlignment;
      this._rotation = params.rotation;
      this._sections = [];
      this._section_count = params.sectionCount;
      this._section_classes = params.sectionClasses;
      this._render_interval = params.renderInterval;
      this._major_axis_max = params.majorAxisMax || 0;
      this._major_axis_min = params.majorAxisMin || 0;
      this._resize_throtle_interval = params.resizeThrotleInterval;
      this._throttled = false;
      this._host_dimensions = params.hostDimensions;
      this._major_axis = GoldenSection.calculateMajorAxis(this.hostDimensions, this.orientation, this.majorAxisMax, this.majorAxisMin);
      window.addEventListener('resize', function () {
        _this.resizeHandler();
      });
    }

    _createClass(GoldenSectionUi, [{
      key: "appendSection",
      value: function appendSection(section, timeout) {
        var _this2 = this;

        this.sections.push(section);

        if (typeof timeout === 'undefined' || timeout === 0) {
          this.host.appendChild(section.element);
        } else {
          setTimeout(function () {
            _this2.host.appendChild(section.element);
          }, timeout);
        }
      }
    }, {
      key: "getSectionClass",
      value: function getSectionClass(ix) {
        if (this.sectionClasses.length >= ix + 1) {
          return this.sectionClasses[ix];
        } else if ((ix + 1) % this.sectionClasses.length === 0) {
          return this.sectionClasses[this.sectionClasses.length - 1];
        } else {
          return this.sectionClasses[(ix + 1) % this.sectionClasses.length - 1];
        }
      }
    }, {
      key: "resizeHandler",
      value: function resizeHandler() {
        var _this3 = this;

        if (!this.throttled) {
          this.transformUiSections();
          this.throttled = true;
          setTimeout(function () {
            _this3.throttled = false;
          }, this.resizeThrotleInterval);
        }
      }
    }, {
      key: "transformUiSections",
      value: function transformUiSections() {
        var transform_interval_constant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var css_transition = arguments.length > 1 ? arguments[1] : undefined;
        this.hostDimensions = GoldenSection.getHostDimensions(this.host);
        this.majorAxis = GoldenSection.calculateMajorAxis(this.hostDimensions, this.orientation, this.majorAxisMax, this.majorAxisMin);
        var base_node_division = GoldenSection.calculateMajorAxisDivisions(this.majorAxis);
        this.sections[0].coordinates = GoldenSection.calculateStartCoordinates.apply(GoldenSection, _toConsumableArray(base_node_division).concat([this]));
        this.sections[0].dimension = base_node_division[0];
        this.sections[0].sectionClass = this.getSectionClass(0);

        _resetCssTransition(this.sections[0], css_transition);

        this.sections[0].transformSection();
        var section_dimension = base_node_division[1];
        var section_orientation = GoldenSection.indexOrientation(this.orientation, this.rotation, 2);
        var transform_interval = transform_interval_constant;

        for (var i = 1; i < this.sections.length; i++) {
          var sibling_section = this.sections[i - 1];
          var coordinates = GoldenSection.calculateSectionCoordinates.apply(GoldenSection, [sibling_section.dimension, section_dimension].concat(_toConsumableArray(sibling_section.coordinates), [section_orientation, this.rotation]));
          this.sections[i].coordinates = coordinates;
          this.sections[i].dimension = section_dimension;
          this.sections[i].sectionClass = this.getSectionClass(i);

          _resetCssTransition(this.sections[i], css_transition);

          if (transform_interval_constant) {
            _transformSectionOnDelay(this.sections[i], transform_interval);

            transform_interval += transform_interval_constant;
          } else {
            this.sections[i].transformSection();
          }

          section_dimension = sibling_section.dimension - section_dimension;
          section_orientation = GoldenSection.indexOrientation(section_orientation, this.rotation, 1);
        }

        function _transformSectionOnDelay(section, interval) {
          setTimeout(function () {
            section.transformSection();
          }, interval);
        }

        function _resetCssTransition(section, css_transtion) {
          if (typeof css_transtion !== 'undefined') {
            section.cssTransition = GoldenSection.normalizeCssTransition(css_transtion);
          }
        }
      }
    }, {
      key: "transformUi",
      value: function transformUi(params) {
        if (params.hasOwnProperty('orientation')) {
          this.orientation = params.orientation;
        }

        if (params.hasOwnProperty('rotation')) {
          this.rotation = params.rotation;
        }

        if (params.hasOwnProperty('alignment')) {
          this.alignment = params.alignment;
        }

        if (params.hasOwnProperty('verticalAlignment')) {
          this.verticalAlignment = params.verticalAlignment;
        }

        if (params.hasOwnProperty('sectionClasses')) {
          this.sectionClasses = params.sectionClasses;
        }

        var transform_interval_constant = params.transformInterval ? params.transformInterval : 0;
        this.transformUiSections(transform_interval_constant, params.cssTransition);
      }
    }, {
      key: "alignment",
      get: function get() {
        return this._alignment;
      },
      set: function set(val) {
        this._alignment = val;
      }
    }, {
      key: "host",
      get: function get() {
        return this._host;
      }
    }, {
      key: "hostDimensions",
      get: function get() {
        return this._host_dimensions;
      },
      set: function set(obj) {
        this._host_dimensions = obj;
      }
    }, {
      key: "id",
      get: function get() {
        return this._id;
      }
    }, {
      key: "majorAxis",
      get: function get() {
        return this._major_axis;
      },
      set: function set(val) {
        this._major_axis = val;
      }
    }, {
      key: "majorAxisMax",
      get: function get() {
        return this._major_axis_max;
      }
    }, {
      key: "majorAxisMin",
      get: function get() {
        return this._major_axis_min;
      }
    }, {
      key: "orientation",
      get: function get() {
        return this._orientation;
      },
      set: function set(val) {
        this._orientation = val;
      }
    }, {
      key: "renderInterval",
      get: function get() {
        return this._render_interval;
      }
    }, {
      key: "resizeThrotleInterval",
      get: function get() {
        return this._resize_throtle_interval;
      }
    }, {
      key: "rotation",
      get: function get() {
        return this._rotation;
      },
      set: function set(val) {
        this._rotation = val;
      }
    }, {
      key: "sectionCount",
      get: function get() {
        return this._section_count;
      }
    }, {
      key: "sections",
      get: function get() {
        return this._sections;
      }
    }, {
      key: "sectionClasses",
      get: function get() {
        return this._section_classes;
      },
      set: function set(obj) {
        this._section_classes = obj;
      }
    }, {
      key: "throttled",
      get: function get() {
        return this._throttled;
      },
      set: function set(val) {
        this._throttled = val;
      }
    }, {
      key: "verticalAlignment",
      get: function get() {
        return this._vertical_alignment;
      },
      set: function set(val) {
        this._vertical_alignment = val;
      }
    }]);

    return GoldenSectionUi;
  }();

  var Section =
  /*#__PURE__*/
  function () {
    function Section(params) {
      _classCallCheck(this, Section);

      this._id = params.id;
      this._coordinates = params.coordinates;
      this._dimension = params.dimension;
      this._section_class = params.sectionClass;
      this._css_transition = params.cssTransition;
      this._orientation = params.orientation;
      this._element = document.createElement('div');
      this.element.id = this.id;
      this.element.className = this.sectionClass;
      this.element.setAttribute('style', "position:absolute; left:".concat(this.coordinates[0], "px; top:").concat(this.coordinates[1], "px; height:").concat(this.dimension, "px; width:").concat(this.dimension, "px; transition: all ").concat(this.cssTransition.duration, "ms ").concat(this.cssTransition.timing, ";"));
    }

    _createClass(Section, [{
      key: "addClass",
      value: function addClass(cls) {
        this.element.className = "".concat(this.element.className, " ").concat(cls);
      }
    }, {
      key: "appendContent",
      value: function appendContent(content) {
        if (typeof content === 'string') {
          this.element.appendChild(document.createTextNode(content));
        } else if (content instanceof Element) {
          this.element.appendChild(content);
        } else if (_typeof(content) === 'object' && content.hasOwnProperty('element') && content.element instanceof Element) {
          this.element.appendChild(content.element);
        } else {
          console.log("Unable to append this ".concat(_typeof(content), " as a child node"));
        }
      }
    }, {
      key: "bindEvent",
      value: function bindEvent(event, cb) {
        this.element.addEventListener(event, function (evt) {
          cb(evt);
        });
      }
    }, {
      key: "classReg",
      value: function classReg(cls) {
        return new RegExp("(^|\\s+)" + cls + "(\\s+|$)");
      }
    }, {
      key: "clearContent",
      value: function clearContent() {
        while (this.element.firstChild) {
          this.element.removeChild(this.element.firstChild);
        }
      }
    }, {
      key: "hasClass",
      value: function hasClass(cls) {
        return this.classReg(cls).test(this.element.className);
      }
    }, {
      key: "removeClass",
      value: function removeClass(cls) {
        this.element.className = this.element.className.replace(this.classReg(cls), ' ');
      }
    }, {
      key: "transformSection",
      value: function transformSection() {
        this.setClass(this.sectionClass);
        this.element.setAttribute('style', "position:absolute; left:".concat(this.coordinates[0], "px; top:").concat(this.coordinates[1], "px; height:").concat(this.dimension, "px; width:").concat(this.dimension, "px; transition: all ").concat(this.cssTransition.duration, "ms ").concat(this.cssTransition.timing, ";"));
      }
    }, {
      key: "setClass",
      value: function setClass(cls) {
        this.element.className = cls;
      }
    }, {
      key: "toggleClass",
      value: function toggleClass(cls) {
        var fn = this.hasClass(cls) ? this.removeClass : this.addClass;
        fn(cls);
      }
    }, {
      key: "coordinates",
      get: function get() {
        return this._coordinates;
      },
      set: function set(obj) {
        this._coordinates = obj;
      }
    }, {
      key: "cssTransition",
      get: function get() {
        return this._css_transition;
      },
      set: function set(obj) {
        this._css_transition = obj;
      }
    }, {
      key: "dimension",
      get: function get() {
        return this._dimension;
      },
      set: function set(val) {
        this._dimension = val;
      }
    }, {
      key: "id",
      get: function get() {
        return this._id;
      }
    }, {
      key: "element",
      get: function get() {
        return this._element;
      },
      set: function set(node) {
        this._element = node;
      }
    }, {
      key: "orientation",
      get: function get() {
        return this._orientation;
      },
      set: function set(val) {
        this._orientation = val;
      }
    }, {
      key: "sectionClass",
      get: function get() {
        return this._section_class;
      },
      set: function set(val) {
        this._section_class = val;
      }
    }]);

    return Section;
  }();

  var GoldenSection =
  /*#__PURE__*/
  function () {
    _createClass(GoldenSection, null, [{
      key: "calculateMajorAxis",
      value: function calculateMajorAxis(host_dimensions, orientation, major_axis_max, major_axis_min) {
        var major_axis = 0;
        var minor_axis_max = 0;
        var node_dimenson = 0;

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
          major_axis = major_axis_max;
        } else if (major_axis_min > 0 && node_dimenson < major_axis_min) {
          major_axis = major_axis_min;
        }

        if (Math.floor(major_axis / GoldenSection.phi) > minor_axis_max) {
          major_axis = Math.floor(minor_axis_max * GoldenSection.phi);
        }

        return major_axis > major_axis_min ? major_axis : major_axis_min;
      }
    }, {
      key: "calculateMajorAxisDivisions",
      value: function calculateMajorAxisDivisions(major_axis) {
        var a = Math.round(Math.round(major_axis * 1000 / GoldenSection.phi) / 1000);
        var b = major_axis - a;
        return [a, b];
      }
    }, {
      key: "calculateSectionCoordinates",
      value: function calculateSectionCoordinates(a, b, x, y, orientation, rotation) {
        var coordinate_x = 0;
        var coordinate_y = 0;

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
    }, {
      key: "calculateStartCoordinates",
      value: function calculateStartCoordinates(a, b, ui_node) {
        var offset_x = 0;
        var offset_y = 0;
        var x = 0;
        var y = 0;
        var ui_dimensions = ui_node.orientation === GS.ORIENTATION.TOP || ui_node.orientation === GS.ORIENTATION.BOTTOM ? {
          width: a,
          height: a + b
        } : {
          width: a + b,
          height: a
        };

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
            x = offset_x;
            y = offset_y + b;
            break;
        }

        return [x, y];
      }
    }, {
      key: "getHostDimensions",
      value: function getHostDimensions(host) {
        return {
          width: host.offsetWidth,
          height: host.offsetHeight
        };
      }
    }, {
      key: "indexOrientation",
      value: function indexOrientation(previous_orientation, rotation, increments) {
        var orientation = previous_orientation;

        for (var i = 0; i < increments; i++) {
          if (rotation === GS.ROTATION.CW) {
            orientation = orientation === 4 ? 1 : orientation + 1;
          } else {
            orientation = orientation === 1 ? 4 : orientation - 1;
          }
        }

        return orientation;
      }
    }, {
      key: "normalizeCssTransition",
      value: function normalizeCssTransition(css_transition) {
        return typeof css_transition === 'undefined' ? {
          duration: 500,
          timing: "ease"
        } : Object.assign({
          duration: 500,
          timing: "ease"
        }, css_transition);
      }
    }, {
      key: "phi",
      get: function get() {
        return 1.6180339887;
      }
    }]);

    function GoldenSection() {
      _classCallCheck(this, GoldenSection);

      this._ui_nodes = {};
    }

    _createClass(GoldenSection, [{
      key: "generate",
      value: function generate(params) {
        if (!this.validateInputParameters(params)) {
          return false;
        }

        params.host = document.getElementById(params.targetNodeId);
        params.hostDimensions = GoldenSection.getHostDimensions(params.host);
        this.initializeHost(params.host);
        var ui_node = new GoldenSectionUi(params);

        if (!ui_node.host) {
          throw new Error('Unable to get refrence to the target element');
        }

        this.uiNodes[ui_node.id] = ui_node;
        var base_node_division = GoldenSection.calculateMajorAxisDivisions(ui_node.majorAxis);
        var primary_section = new Section({
          coordinates: GoldenSection.calculateStartCoordinates.apply(GoldenSection, _toConsumableArray(base_node_division).concat([ui_node])),
          dimension: base_node_division[0],
          id: "".concat(ui_node.id, "-node-0"),
          orientation: ui_node.orientation,
          sectionClass: ui_node.getSectionClass(0),
          cssTransition: params.cssTransition
        });
        ui_node.appendSection(primary_section, 0);
        var section_dimension = base_node_division[1];
        var section_orientation = GoldenSection.indexOrientation(primary_section.orientation, ui_node.rotation, 2);

        for (var i = 1; i < params.sectionCount; i++) {
          var sibling_section = ui_node.sections[i - 1];
          var coordinates = GoldenSection.calculateSectionCoordinates.apply(GoldenSection, [sibling_section.dimension, section_dimension].concat(_toConsumableArray(sibling_section.coordinates), [section_orientation, ui_node.rotation]));
          ui_node.appendSection(new Section({
            coordinates: coordinates,
            dimension: section_dimension,
            id: "".concat(ui_node.id, "-node-").concat(i),
            orientation: section_orientation,
            sectionClass: ui_node.getSectionClass(i),
            cssTransition: params.cssTransition
          }), ui_node.renderInterval * i);
          section_dimension = sibling_section.dimension - section_dimension;
          section_orientation = GoldenSection.indexOrientation(section_orientation, ui_node.rotation, 1);
        }

        return ui_node;
      }
    }, {
      key: "getUiNode",
      value: function getUiNode(host_id) {
        return this.uiNodes[host_id];
      }
    }, {
      key: "initializeHost",
      value: function initializeHost(host) {
        var style = host.getAttribute('style');
        host.setAttribute('style', "".concat(style ? style : '', " position:relative;"));
      }
    }, {
      key: "removeUiNode",
      value: function removeUiNode(host_id) {
        var ui_node = this.uiNodes[host_id];

        while (ui_node.sections.length) {
          ui_node.sections[0].clearContent();
          ui_node.host.removeChild(ui_node.sections[0].element);
          ui_node.sections.splice(0, 1);
        }

        delete this.uiNodes[host_id];
      }
    }, {
      key: "validateInputParameters",
      value: function validateInputParameters(params) {
        var is_valid = true;

        if (typeof params === 'undefined') {
          is_valid = false;
          console.log("Generation Error: a arguments object is required by the generate method.");
        } else if (typeof params.targetNodeId === 'undefined' || params.targetNodeId === '') {
          is_valid = false;
          console.log("Generation Error: a 'targetNodeId' is required by the generate method.");
        } else {
          params.orientation = typeof params.orientation === 'undefined' ? GS.ORIENTATION.RIGHT : params.orientation;
          params.alignment = typeof params.alignment === 'undefined' ? GS.ALIGN.LEFT : params.alignment;
          params.verticalAlignment = typeof params.verticalAlignment === 'undefined' ? GS.VERTICAL_ALIGN.TOP : params.verticalAlignment;
          params.rotation = typeof params.rotation === 'undefined' ? GS.ROTATION.CCW : params.rotation;
          params.renderInterval = typeof params.renderInterval === 'undefined' ? 0 : params.renderInterval;
          params.resizeThrotleInterval = typeof params.resizeThrotleInterval === 'undefined' ? 15 : params.resizeThrotleInterval;

          if (typeof params.sectionCount === 'undefined' || params.sectionCount < 1) {
            params.sectionCount = 6;
          } else {
            params.sectionCount = params.sectionCount > 8 ? 8 : params.sectionCount;
          }

          if (params.sectionClasses === 'undefined') {
            params.sectionClasses = ['wax-golden-section'];
          } else if (typeof params.sectionClasses === 'string') {
            params.sectionClasses = [params.sectionClasses];
          } else if (!Array.isArray(params.sectionClasses)) {
            is_valid = false;
            console.log("Generation Error: an invalid sectionClasses argument was passed: ".concat(JSON.stringify(params.sectionClasses)));
          }

          params.cssTransition = GoldenSection.normalizeCssTransition(params.cssTransition);
        }

        return is_valid;
      }
    }, {
      key: "printApi",
      value: function printApi() {
        console.log("\n            ********************************************************\n            ************ Web Atomix Golden-Section API *************\n\n            Dynamically inject the Golden-Section layout into the DOM\n            by calling goldenSection.generate({params}).\n\n            Parameter Options:\n\n                targetNodeId : REQUIRED, the parent node that will contain teh Golden-Section layout.\n                orientation: Use a GS.ORIENTATION constant to determinte the postion on the largest section in relation to the other sections with the layout.  \n                    It will also determine the direction of the long axis of the layout.\n                alignment: Use a GS.ALIGN constant to determine how the layout is aligned horizontally within the containing element.\n                verticalAlignment: Use a GS.VERTICAL_ALIGN constant to determine how the layout is aligned vertically within the containing element.\n                rotation: Use a GS.ROTATION constant to determine the rotational direction of the layout.\n                sectionCount: An integer value to determine the the number of sections to be rendered, the maximum is 8.\n                sectionClasses: An array of one or more class names to be applied to the redered sections.  A class name is applied to a section in\n                sequence to the sections being rendered.  If there are fewer class names in the array than layout sections, the generator will cycle \n                back through the array of class names, assigning them in sequence.\n                majorAxisMax: An optional integer value that determines the maximum major-axis dimension of the golden-section layout.            \n                majorAxisMin: An optional integer value that determines the minimum major-axis dimension of the golden-section layout. \n                cssTransition: {\n                    duration: An optional millisecond value that mapps to the transition-duration property -- defualt is 500.\n                    timing: An optional property that maps to the transition-timing-function -- default is ease-out.\n                }\n                renderInterval: An optional millisecond setting that controls the rendering of the layout sections.\n                resizeThrotleInterval: An optional millisecond value that throttles the resize event. By default it's set to 15ms.\n\n            ********************************************************\n        ");
      }
    }, {
      key: "uiNodes",
      get: function get() {
        return this._ui_nodes;
      }
    }]);

    return GoldenSection;
  }();

  var goldenSection = new GoldenSection();

  // const GS = require('golden_section').GS;

  document.addEventListener('DOMContentLoaded', function () {
    var ui = goldenSection.generate({
      targetNodeId: "golden-section-wrapper",
      orientation: GS.ORIENTATION.RIGHT,
      alignment: GS.ALIGN.CENTER,
      verticalAlignment: GS.VERTICAL_ALIGN.MIDDLE,
      rotation: GS.ROTATION.CW,
      sectionCount: 7,
      sectionClasses: ["section-square", "section-round"],
      majorAxisMax: 1100,
      majorAxisMin: 100,
      cssTransition: {
        duration: 500,
        timing: "linear"
      },
      renderInterval: 100,
      resizeThrotleInterval: 2
    });

    if (!ui) {
      throw new Error('Failed to create the UI object');
    }

    var rotations = [GS.ROTATION.CW, GS.ROTATION.CCW];
    var orientations = [GS.ORIENTATION.TOP, GS.ORIENTATION.RIGHT, GS.ORIENTATION.BOTTOM, GS.ORIENTATION.LEFT];
    var alignments = [GS.ALIGN.LEFT, GS.ALIGN.CENTER, GS.ALIGN.RIGHT];
    var vertical_alignments = [GS.VERTICAL_ALIGN.TOP, GS.VERTICAL_ALIGN.MIDDLE, GS.VERTICAL_ALIGN.BOTTOM];
    var class_options = ['golden-box', 'section-square', 'section-round', 'rounded-square', 'super-rounded-square', 'black-box', 'white-box'];
    var transition_durations = [100, 250, 500, 750, 1000, 1500, 200];
    var transition_timings = ["linear", "ease", "ease-in", "ease-out"];

    function getRandomClasses() {
      var count = 2;
      var selected_classes = [];

      for (var i = 0; i < count; i++) {
        selected_classes.push(class_options[Math.floor(Math.random() * 7)]);
      }

      return selected_classes;
    }

    var interval = setInterval(function () {
      ui.transformUi({
        orientation: orientations[Math.floor(Math.random() * 4)],
        alignment: alignments[Math.floor(Math.random() * 3)],
        verticalAlignment: vertical_alignments[Math.floor(Math.random() * 3)],
        rotation: rotations[Math.floor(Math.random() * 2)],
        sectionClasses: getRandomClasses(),
        cssTransition: {
          duration: transition_durations[Math.floor(Math.random() * 7)],
          timing: transition_timings[Math.floor(Math.random() * 4)]
        },
        transformInterval: 100
      });
    }, 3000); // setTimeout(()=>{
    //     clearInterval(interval);
    // }, 10000);
  });

}());
//# sourceMappingURL=app.js.map

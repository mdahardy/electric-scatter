// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- VARIABLE DECLARATIONS -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

let very_small_height, loader_timeout,density_y_scale,scaled_curve_data,scaled_global_thresholds,density_data, y_axis_ticks_selector, svg_plotting_group,outer_svg,max_histogram_data,mousemove_timeout,current_transition_function,resize_timeout,small_width,small_height,tooltip_alignment,svg_width,svg_height,margins,adjusted_width,adjusted_height,histogram_data,x_scale,bar_width,plot_wrapper_x,plot_wrapper_y,width_4850,width_150;
let html_section = -1;
let css_section = -1;
let captions_section = 0;
let global_scroll_percentage = 0;
let has_toolbar = false;
let content_obj = document.documentElement;
let is_playing = false;
let wait = false;
let is_muted = false;
const fullscreen_index = getFullScreenIndices();
let fullscreen = false;
let scroll_duration = 420295.27339799995; // Length of audio
let constant_scroll_duration = scroll_duration;
let wrapper_is_progress_bar = true;
const has_mouse = window.matchMedia("(any-pointer:fine)").matches;
const down_string = has_mouse ? 'mousedown' : 'touchstart';
const move_string = has_mouse ? 'mousemove' : 'touchmove';
const end_string = has_mouse ? 'mouseup' : 'touchend';
let is_small = window.matchMedia("(max-width:834px)").matches;
let small_translate = is_small ? 'translateY(' : 'translateX(-';
let density_inner = window.matchMedia("(orientation:portrait)").matches ?'mobile':'desktop';
let screen_type = getScreenTypeForEarnerTransitions();
let full_controls_timeout = true;
let just_resized = false;
const countdown_selector = d3.select('#countdown');
let already_made_plot = false;
const x_axis_max_income = 140000;
let inner_width = window.innerWidth;
const audio = new Audio("audio/voiceover.mp3");
let has_loaded_data = false;
let already_loaded_page = false;
let has_loaded_metadata = false;
let is_loading = false;
let audio_offset_tolerance = is_small ? 0.75 : 0.5;
const loader_content = d3.select('#loader-content');
let extra_sections_included = sessionStorage.getItem('extra_sections_included')==='true';
let show_closed_captions = sessionStorage.getItem('show_closed_captions')==='true';
const session_speed_multiplier = sessionStorage.getItem('speed_multiplier');
let speed_multiplier = session_speed_multiplier == undefined ? 1 : +session_speed_multiplier;
let incomes_restored = true;
let incomes_event_listener = false;

const histogram_y_max_dict = {
    10000: {
        'n':500000,
        'p':0.04
    },
    5000:{
        'p':0.02
    },
    1000:{
        'p':0.003
    },
    100:{
        'p':0.0007
    },
    'densities': 0.000002
}

const earner_transition_dict = {
    'large_desktop': [95,125,175,125],
    'desktop': [72,115,140,115],
    'landscape_smartphone': [-88,48,-50,48],
    'normal_smartphone': [64,245,115,96],
    'small_smartphone':[55,212,101,73],
    'small_screen':[103,285,170,115]
}

// For safari
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// For toggling mean and median divs
const max = 999;
let mean_vals = [[50,50,50,50,50],[100,40,40,40,40]];
let median_vals = [[0,0,50,50,50],[100,40,40,40,40]];
let means = [50,52];
let medians = [50,40];
let comparitor_indices = [-1,1]; // -1 Less than, 0 equal, 1 greater than
let og_comparitor_indices = [-1,1];
let current_comparing_index = -5;
let set_up_plot = true;
let set_up_densities = true;

// Plots setup
let currently_including_millennials = false;
let plotting_histogram_proportions = false;
const density_hover_start = has_mouse ? 'mousemove' : 'touchstart touchmove';
const density_hover_end = has_mouse ? 'mouseout' : 'touchend';
const histogram_tooltip = d3.select('#histogram-tooltip');
const density_tooltip = d3.select('#density-tooltip');
const density_tooltip_top = d3.select("#density-tooltip-top");
const generation_tooltip_selectors = {
    'millennials':d3.select('#density-tooltip-millennials'),
    'boomers':d3.select('#density-tooltip-boomers')
};
const density_tooltip_indices = {
    'millennials':-1,
    'boomers':-1
};

let captions_sections = [ 0.00253, 0.00728, 0.01367, 0.01882, 0.02403, 0.02856, 0.0316, 0.03636, 0.04281, 0.04736, 0.05214, 0.05881, 0.06389, 0.06826, 0.07296, 0.07817, 0.08151, 0.08751, 0.09202, 0.09492, 0.10049, 0.10455, 0.11256, 0.11744, 0.12021, 0.12444, 0.13015, 0.13344, 0.13893, 0.14318, 0.14771, 0.14983, 0.15590, 0.16152, 0.16589, 0.17029, 0.17484, 0.17931, 0.18491, 0.18966, 0.19603, 0.19832, 0.20266, 0.20760, 0.21492, 0.21769, 0.22450, 0.22841, 0.23319, 0.23672, 0.23921, 0.24361, 0.24734, 0.25262, 0.25679, 0.25994, 0.26380, 0.27024, 0.27520, 0.27831, 0.2822, 0.28730, 0.29231, 0.29659, 0.29899, 0.30206, 0.30855, 0.3129, 0.31581, 0.31931, 0.32262, 0.32512, 0.33051, 0.33318, 0.33670, 0.34043, 0.34385, 0.3473, 0.35176, 0.35814, 0.3625, 0.36685, 0.36977, 0.37381, 0.37774, 0.38353, 0.38706, 0.39055, 0.39218, 0.39606, 0.3999, 0.40359, 0.40842, 0.41107, 0.41667, 0.41886, 0.42200, 0.42583, 0.43128, 0.43675, 0.44035, 0.44519, 0.44954, 0.45524, 0.45915, 0.46520, 0.46807, 0.47251, 0.47829, 0.48258, 0.48782, 0.49528, 0.50291, 0.50584, 0.51301, 0.51950, 0.52270, 0.52811, 0.53115, 0.53674, 0.54288, 0.5484, 0.55493, 0.5601, 0.56507, 0.56853, 0.57271, 0.57903, 0.58186, 0.59022, 0.59285, 0.59677, 0.60620, 0.61077, 0.61573, 0.61776, 0.62427, 0.62899, 0.63160, 0.63534, 0.64161, 0.64464, 0.64838, 0.65320, 0.65742, 0.66359, 0.66948, 0.67419, 0.67652, 0.68106, 0.68358, 0.68915, 0.69375, 0.69924, 0.70241, 0.70635, 0.70916, 0.71317, 0.71857, 0.72245, 0.72702, 0.73277, 0.73924, 0.74277, 0.74810, 0.75203, 0.75920, 0.76420, 0.76907, 0.77428, 0.77762, 0.78056, 0.78493, 0.79094, 0.79629, 0.80170, 0.80664, 0.81092, 0.81798, 0.82101, 0.82843, 0.83696, 0.84329, 0.84837, 0.85490, 0.86117, 0.86706, 0.87131, 0.87781, 0.88535, 0.88904, 0.89375, 0.90201, 0.90459, 0.91035, 0.91459, 0.91848, 0.92223, 0.92983, 0.93512, 0.93950, 0.94304, 0.94697, 0.95273, 0.96012, 0.96973, 0.97384, 0.98083, 0.98587, 0.99039, 0.99296, 0.99926 ];
const captionsFunction = d3.scaleThreshold().domain(captions_sections).range(Array.from(new Array(captions_sections.length+1), (x,i) => i)); // maps scroll percentage to caption section
const unscaled_tholds = [ 0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000, 36000, 38000, 40000, 42000, 44000, 46000, 48000, 50000, 52000, 54000, 56000, 58000, 60000, 62000, 64000, 66000, 68000, 70000, 72000, 74000, 76000, 78000, 80000, 82000, 84000, 86000, 88000, 90000, 92000, 94000, 96000, 98000, 100000, 102000, 104000, 106000, 108000, 110000, 112000, 114000, 116000, 118000, 120000, 122000, 124000, 126000, 128000, 130000, 132000, 134000, 136000, 138000, 140000 ];

// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- VIDEO STRUCTURE -- -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

const video_structure_dict = {
    0: {
        'included': true,
        'total_height': 100,
        'height': 100,
        'toggleable':false,
        'transitions': {
            '0': { 
                title_wrapper: d3.select('#title-wrapper'),
                title_background: d3.select("#title-background"),
                d_line_0: d3.select(`.${density_inner}-density-line-0`),
                d_line_1: d3.select(`.${density_inner}-density-line-1`),
                d_line_2: d3.select(`.${density_inner}-density-line-2`),
                density_inner_string: density_inner,
                animation_function: function(input_percentage){
                    if (this.density_inner_string !== density_inner){
                        this.d_line_0 = d3.select(`.${density_inner}-density-line-0`);
                        this.d_line_1 = d3.select(`.${density_inner}-density-line-1`);
                        this.d_line_2 = d3.select(`.${density_inner}-density-line-2`);
                        this.density_inner_string = density_inner;
                    }
                    this.title_wrapper.style('opacity',`${1-input_percentage}`)//.style('transform',`scale(${1 + (input_percentage*20)})`);
                    this.title_background.style('opacity',`${(input_percentage*(-0.08)) +0.08}`);
                    this.d_line_0.style('transform',`${small_translate}${input_percentage*55}%)`);
                    this.d_line_1.style('transform',`translateY(-${input_percentage*55}%)`);
                    this.d_line_2.style('transform',`translateX(${input_percentage*55}%)`);
                }
            }
        }
    },

    1: {
        'included': true,
        'total_height':7800,
        'height':7700,
        'toggleable':false,
        'css_sections':[0.01987, 0.08156, 0.16455, 0.3249, 0.35792, 0.39740, 0.574, 0.75, 0.87351, 0.9625],
        'transitions': {
            '1':{
                selector: d3.select("#sequoias-1-wrapper"),
                animation_function: function(input_percentage){
                    this.selector.style('transform',`translate(${input_percentage*2}%,${input_percentage*4}%)`);
                }
            },
            '2':{
                selector:d3.select("#sd-1-wrapper"),
                animation_function: function(input_percentage){
                    this.selector.style('transform',`translate(${input_percentage*4}%,${input_percentage*1}%)`);
                }
            },
            '3':{
                selector:d3.select("#millennials-1-wrapper"),
                animation_function: function(input_percentage){
                    this.selector.style('transform',`translate(-${input_percentage*3}%,-${input_percentage*1}%)`);
                }
            },
            '9':{
                selector:d3.select("#numbers-wrapper"),
                animation_function:function(input_percentage){
                    this.selector.style('transform',`translateY(-${input_percentage*2}%`);
                }
            }
        }
    },
    2: {
        'total_height': 8751, // 8762, 
        'height':951,
        'included':true,
        'toggleable':false,
        'css_sections': [0.017874384858043737]
    },

    3:{
        'included': true,
        'total_height': 11256, // 11241,
        'height': 2505,
        'toggleable':false,
        'css_sections':[0.29580802395209616, 0.4223556886227546]
    },

    4:{
        'included': true,
        'total_height': 15590,// 15627,
        'height':4334,
        'toggleable':true,
        'toggled_html_sections': [5,6,7,8,9],
        'selection_text': ['Add 2:50 about summary stats','2:50 about summary stats added'],
        'additional_time_string': '2:50',
        'current_toggle_selected': false,
        'css_sections': [0.08102353484079393, 0.27411, 0.36479101522842633, 0.4149386248269495, 0.5272226026765111],
        'transitions':{
            '3':{
                selector0: d3.select('#phantom-user-div-0'),
                selector1: d3.select('#phantom-user-div-1'),
                both_selectors: d3.selectAll('#phantom-user-div-0, #phantom-user-div-1'),
                bottom_info_selector: d3.selectAll(".mean-example-1 "),
                animation_function: function(input_percentage){
                    this.selector0
                        .style('transform',`translate(${-input_percentage*earner_transition_dict[screen_type][0]}px,${input_percentage*earner_transition_dict[screen_type][1]}px) scaleX(${1 - input_percentage})`)
                        .style('opacity', 1-input_percentage);
                    this.selector1
                        .style('transform', `translate(${input_percentage*earner_transition_dict[screen_type][2]}px,${input_percentage*earner_transition_dict[screen_type][3]}px) scaleX(${1 - input_percentage})`)
                        .style('opacity', 1-input_percentage);
                    this.bottom_info_selector.style('opacity',`${input_percentage}`)
                },
                reverting_function: function(){                    
                    this.both_selectors
                        .style('transform', null)
                        .style('opacity', null);
                    this.bottom_info_selector.style('opacity',null)
                }
            }
        }
    },
    5:{
        'included': false,
        'total_height': 27028, //27024
        'height': 11438,
        'toggleable':false,
        'css_sections': [0.06434756961081593, 0.1658031200256592, 0.29554660779856623, 0.3713609742378948, 0.42012116296847785, 0.4525916681237979, 0.4789490023013612, 0.5605389207241662, 0.7293218845418901, 0.799435879807907, 0.8832231029256588],
        'transitions': {
            '5':{
                selector0: d3.select('.millennial-1'),
                animation_function: function(input_percentage){
                    this.selector0.html(`$${ Math.round(50 + (50*input_percentage)) }k`)
                },
                reverting_function: function(){
                    this.selector0.html(`$50k`)
                }
            },
            '6':{
                selector0: d3.selectAll('.millennial-group-2'),
                animation_function: function(input_percentage){
                    this.selector0.html(`$${ Math.round(50 + (-10*input_percentage)) }k`)
                },
                reverting_function: function(){
                    this.selector0.html(`$50k`)
                }
            }
        }
    },

    6:{
        'included': false,
        'total_height': 30864, // 30855,
        'height': 3836,
        'toggleable':false,
        'css_sections': [0.20932772158498433, 0.3134168326381649, 0.6154126850886341]
    },
    7:{
        'included': false,
        'total_height': 34043, // 34024,
        'height':3179,
        'toggleable':false,
        'css_sections': [0.22584208870714098, 0.5341344888329663, 0.6369899213589187, 0.6879491160742369, 0.8447110412079271]
    },
    8:{
        'included': false,
        'total_height': 41667,
        'height':7624,
        'toggleable':false,
        'css_sections': [0.04676652041099701, 0.151053329630658, 0.5699219994445991, 0.6624790447098031, 0.7857516578728133],
        'transitions':{
            '1':{
                selector0: d3.select('.millennial-1'),
                selector1: d3.selectAll('.millennial-group-2'),
                selector2: d3.select("#original-millennial-median"),
                animation_function: function(input_percentage){
                    const new_median = Math.round(50 + (-10*input_percentage));
                    this.selector0.html(`$${ Math.round(50 + (50*input_percentage)) }k`);
                    this.selector1.html(`$${ new_median }k`);
                    this.selector2.html(`Median: $${ new_median }k`);
                },
                reverting_function: function(){
                    this.selector0.html(`$50k`);
                    this.selector1.html(`$50k`);
                    this.selector2.html(`Median: $50k`);
                }
            },
            '3':{
                selector0: d3.selectAll('.two-lowest-original'),
                animation_function: function(input_percentage){
                    this.selector0.html(`$${ Math.round(50 - (50*input_percentage)) }k`);
                },
                reverting_function: function(){
                    this.selector0.html(`$50k`);
                }
            }
        }
    },
    9:{
        'included': false,
        'total_height': 44519,
        'height': 2852,
        'toggleable':false,
        'css_sections': [0.18689,0.95],
        'transitions':{
            '1':{
                selector:d3.select("#summary-stats-wrapper"),
                animation_function:function(input_percentage){
                    this.selector.style('transform',`translateY(-${input_percentage*22}%`);
                }
            }
        }
    },

    10:{
        'included': true,
        'total_height': 46520,
        'height':2001,
        'toggleable':false,
        'css_sections': [0.21739,0.41739,0.61739,0.81739],
        'startup_function': function(){
            if (!extra_sections_included){
                if (is_playing){
                    audio.pause();
                    d3.select('body').interrupt();
                    audio.currentTime = global_audio_and_captions_percentage * audio.duration;
                    audio.removeEventListener('canplaythrough',playAfterDelay);
                    loadAudioDuringVideo(false);
                }
            }
        },
        'transitions':{
            '1':{
                first_call: true,
                index:0,
                density_inner_string: undefined,
                animation_function: function(input_percentage){
                    drawing_function_10.bind(this)(input_percentage);
                },
                reverting_function: function(){
                    drawing_reverting_function_10.bind(this)();
                }
            },
            '2':{
                first_call: true,
                index:1,
                density_inner_string: undefined,
                animation_function: function(input_percentage){
                    drawing_function_10.bind(this)(input_percentage);
                },
                reverting_function: function(){
                    drawing_reverting_function_10.bind(this)();
                }
            },
            '3':{
                first_call: true,
                index:2,
                density_inner_string: undefined,
                animation_function: function(input_percentage){
                    drawing_function_10.bind(this)(input_percentage);
                },
                reverting_function: function(){
                    drawing_reverting_function_10.bind(this)();
                }
            }
        }
    },
    11:{
        'included': true,
        'total_height': 53674,
        'height':7154,
        'toggleable':false,
        'css_sections': [0.12958,0.24294101202124696,0.52712]
    },
    12:{
        'included': true,
        'total_height': 61077,
        'height':7403,
        'toggleable':false,
        'startup_function': function(){
            currently_including_millennials = false;
            plotting_histogram_proportions = false;
            initialHistogramSetup(10000); 
        },
        'css_sections': [0.013370322842090753, 0.10644653518843684, 0.2493354099689316, 0.2866409563690392, 0.6574351938403352, 0.7224102715115491, 0.810888969336755, 0.9223177090368766],
        'transitions':{
            '2': {
                scale_function: d3.scaleThreshold().domain([0.07142857142857142,0.14285714285714285,0.21428571428571427,0.2857142857142857,0.3571428571428571,0.42857142857142855,0.5,0.5714285714285714,0.6428571428571428,0.7142857142857142,0.7857142857142857,0.8571428571428571,0.9285714285714285]).range([1,2,3,4,5,6,7,8,9,10,11,12,13,14]),
                current_index: -1,
                animation_function:function(input_percentage){
                    const new_index = this.scale_function(input_percentage);
                    if (this.current_index!=new_index){
                        const curr_dollars_income = ((new_index-1)*10000);
                        const curr_k_income = Math.round(curr_dollars_income/1000);
                        const min_string = curr_k_income == 0 ? `$0` : addCommasToK(curr_k_income);
                        const max_string = addCommasToK(Math.round(curr_k_income+10));
                        changeTooltipCentering(histogram_tooltip,curr_dollars_income,tooltip_alignment);
                        updateTooltipPosition(curr_dollars_income,adjusted_height,`Annual income<br>${min_string} - ${max_string}`);
                        this.current_index = new_index
                    }
                },
                reverting_function:function(){
                    histogram_tooltip.style("opacity","0");
                    this.current_index = -1;
                },
                resizing_function: function(){
                    this.current_index = -1;
                }
            },
            '3':{
                histogram_bars: undefined,
                animation_function: function(input_percentage){
                    if (this.histogram_bars==undefined) this.histogram_bars = svg_plotting_group.selectAll(`.histogram-bar`);
                    this.histogram_bars
                        .attr("y",d=> (input_percentage * (histogram_y_scale(d.n) - adjusted_height)) + adjusted_height )// here I need to intpolate between y_scale(0) and y_scale(d.n)
                        .attr("height", d=>input_percentage * (adjusted_height - histogram_y_scale(d.n)) )//d  => here I need to interpolate between 0 and adjusted_height - y_scale(d.n)
                },
                reverting_function: function(){
                    if (this.histogram_bars){
                        this.histogram_bars
                            .attr("y",d=>histogram_y_scale(d.n))
                            .attr("height", d  => adjusted_height - histogram_y_scale(d.n));
                        this.histogram_bars = undefined;
                    }
                },
                resizing_function: function(){
                    this.histogram_bars = undefined;
                }
            }
        }
    },

    13:{
        'included': true,
        'total_height': 65742,//65742
        'height':4665,
        'toggleable':false,
        'startup_function': function(){
            currently_including_millennials = true;
            plotting_histogram_proportions = false;
            initialHistogramSetup(10000);        
        },
        'css_sections':[0.08553305894962535, 0.5266868188638805, 0.90954],
        'transitions':{
            '0':{
                millennials_bars:undefined,
                animation_function: function(input_percentage){
                    if (this.millennials_bars==undefined) this.millennials_bars = svg_plotting_group.selectAll(`.millennials-bar`);
                    this.millennials_bars
                        .attr("y",d=> (input_percentage * (histogram_y_scale(d.n) - adjusted_height)) + adjusted_height )// here I need to intpolate between histogram_y_scale(0) and histogram_y_scale(d.n)
                        .attr("height", d=>input_percentage * (adjusted_height - histogram_y_scale(d.n)) )//d  => here I need to interpolate between 0 and adjusted_height - histogram_y_scale(d.n)
                },
                reverting_function: function(){
                    if (this.millennials_bars){
                        this.millennials_bars
                            .attr("y",d=>histogram_y_scale(d.n))
                            .attr("height", d  => adjusted_height - histogram_y_scale(d.n));
                        }
                    this.millennials_bars = undefined;
                },
                resizing_function: function(){
                    this.millennials_bars = undefined;
                }
            }
        }
    },
    14:{
        'included': true,
        'total_height': 66359,
        'height':617,
        'toggleable':false,
        'startup_function': function(){
            plotting_histogram_proportions = false;
            currently_including_millennials = true;
            initialHistogramSetup(10000);
            plotting_histogram_proportions = true;
            this.transitions['0'].initialSetup();
        },
        'transitions':{
            '0': {
                old_y_scale:undefined,
                new_y_scale:undefined,
                y_axis_ticks: undefined,
                y_axis_label: undefined,
                initialSetup: function(){
                    this.old_y_scale = d3.scaleLinear().domain([0, d3.max(histogram_data[10000], d => d.n)+histogram_y_max_dict[10000]['n']]).range([adjusted_height, 0]);
                    this.new_y_scale = d3.scaleLinear().domain([0, d3.max(histogram_data[10000], d => d.p) + histogram_y_max_dict[10000]['p']]).range([adjusted_height, 0]);
                    d3.selectAll('.axes').remove();
                    getMargins();
                    x_scale = getXScale();
                    histogram_y_scale = getHistogramYScale(10000);
                    makeAxes('histogram',10000);
                    this.y_axis_ticks = y_axis_ticks_selector.selectAll('.tick');
                    this.y_axis_label = outer_svg.select('.y-axis-label');
                },
                animation_function: function(input_percentage){
                    this.y_axis_ticks.style('opacity',input_percentage);
                    this.y_axis_label.style('opacity',input_percentage);
                    updateHistogram(this.old_y_scale,this.new_y_scale,input_percentage);
        
                }
            }
        }
    },

    15:{
        'included': true,
        'total_height': 72245,
        'height':5886,
        'toggleable':false,
        'startup_function': function(){
            plotting_histogram_proportions = true;
            currently_including_millennials = true;
            initialHistogramSetup(10000);        
        },
        'css_sections':[0.33962,0.60567]
    },
    16:{
        'included': true,
        'total_height': 72702,
        'height':457,
        'toggleable':false,
        'startup_function': function(){
            plotting_histogram_proportions = true;
            currently_including_millennials = true;
            initialHistogramSetup(5000);        
        }
    },
    17:{
        'included': true,
        'total_height': 73277,
        'height': 575,
        'toggleable':false,
        'startup_function': function(){
            plotting_histogram_proportions = true;
            currently_including_millennials = true;
            initialHistogramSetup(1000); 
        }
    },
    18:{
        'included': true,
        'total_height': 74810,
        'height':1533,
        'toggleable':false,
        'startup_function':function(){
            plotting_histogram_proportions = true;
            currently_including_millennials = true;
            const plot_bin_width = small_height ? 1000 : 100;
            initialHistogramSetup(plot_bin_width);
        }
    },
    19:{
        'included': true,
        'total_height': 75920,
        'height': 1110,
        'toggleable':false,
        'css_sections':[0.88899],
        'startup_function':function(){
            plotting_histogram_proportions = true;
            currently_including_millennials = true;
            const plot_bin_width = is_small ? 1000 : 100;
            initialHistogramSetup(plot_bin_width);
            if (set_up_densities) getDensityInfo();
            drawDensityPlot(['boomers','millennials']);
            makeClipPaths();
            d3.selectAll('.axes').remove();
            makeAxes('density');
        },
        'transitions':{
            '0':{
                density_clip: undefined,
                histogram_clip_rect:undefined,
                animation_function:function(input_percentage){
                    if (!this.density_clip){
                        this.density_clip = svg_plotting_group.select(`#density-clip-rect`);
                        this.histogram_clip_rect = svg_plotting_group.select(`#histogram-clip-rect`);
                    }
                    this.density_clip.attr('width',`${input_percentage * adjusted_width}px`);
                    this.histogram_clip_rect.attr('x',`${input_percentage * adjusted_width}px`).attr('width',`${(1-input_percentage) * adjusted_width}px`);
                },
                reverting_function:function(){
                    this.density_clip = undefined;
                    this.histogram_clip_rect = undefined;                
                },
                resizing_function:function(){
                    this.density_clip = undefined;
                    this.histogram_clip_rect = undefined;                                
                }
            }
        }
    },
    20:{
        'included': true,
        'total_height': 80664,
        'height': 4744,
        'toggleable':false,
        'startup_function': function(){
            makeDensityPlot(['boomers','millennials']);
        }
    },
    21:{

        'included': true,
        'total_height': 83340,
        'height':2676,
        'toggleable':false,
        'startup_function': function(){
            makeDensityPlot(['millennials']);
            drawTriangle('center');
            highlight50to100();
        },
        'css_sections':  [0.53700, 0.7878338534697636, 0.9104954176897905],
        'transitions':{
            '3':{
                millennial_curve:undefined,
                triangle:undefined,
                animation_function:function(input_percentage){
                    if (!this.millennial_curve){
                        this.millennial_curve = d3.select(".millennials-curve");
                        this.triangle = d3.select("#triangle-example");
                        this.highlight_rect = d3.select("#highlight-50-100")
                    }
                    this.millennial_curve.style('opacity',0.65 - (0.65*input_percentage));
                    this.triangle.style('transform',`translateX(-${input_percentage * x_scale(50000)}px)`);
                },
                reverting_function:function(){
                    if (this.millennial_curve){
                        this.millennial_curve.style('opacity',null);
                        this.triangle.style('transform',null);
                        this.millennial_curve = undefined;
                        this.triangle = undefined;
                    }
                },
                resizing_function:function(){
                    this.millennial_curve = undefined;
                    this.triangle = undefined;
                    this.highlight_rect = undefined;
                }
            }
        }
    },

    22:{
        'included': true,
        'total_height': 84837,
        'height': 1497,
        'toggleable':false,
        'css_sections':[0.03540],
        'startup_function':function(){
            densitySetup();
            makeTriangleAxes();
            drawTriangle('left');
        },
    },
    23:{
        'included': true,
        'total_height': 96973,
        'height': 12136,
        'toggleable':false,
        'startup_function':function(){
            makeDensityPlot(['boomers','millennials']);
            makeArrowLines();
            makeOpacityRects();
        },
        'css_sections': [0.18902240359261713, 0.30471330998681606, 0.4419908231707313, 0.6891926433750827, 0.7148171489782461, 0.7509045715227427, 0.9882128642056685]
    }, 

    24:{
        'included': true,
        'total_height': 97384,
        'height':411,
        'toggleable':false,
        'startup_function':function(){
            d3.select("#es-background").classed('final-header-shown',true);
        },
        'end_function':function(){
            d3.select('#es-background').style('clip-path','inset(0px 0px calc(100% - 45px) 0px)');
            d3.select("#es-background").classed('final-header-shown',false);
        },
        'transitions':{
            '0':{
                es_background: d3.select('#es-background'),
                animation_function:function(input_percentage){
                    this.es_background.style('clip-path',`inset(0px 0px calc(${1-input_percentage} * (100% - 45px)) 0px)`);
                },
                reverting_function:function(){
                    this.es_background.style('clip-path',`inset(0px 0px calc(100% - 45px) 0px)`);
                }
            }
        }
    },

    25:{
        'included': true,
        'total_height': 100000,
        'height':2616,
        'toggleable':false,
        'css_sections': [0.26720,0.45986,0.63265],
        'startup_function':function(){
            d3.select("#es-background").classed('final-header-shown',true).style('clip-path','none');
        },
        'end_function':function(){
            d3.select('#es-background').classed('final-header-shown',false).style('clip-path','inset(0px 0px calc(100% - 45px) 0px)');
        }
    }
}

// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- TRIGGER START -- -- -- -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

let [html_sections, html_list_sections] = makeHTMLList();
let htmlFunction = d3.scaleThreshold().domain(html_sections).range(html_list_sections); // maps scroll percentage to html_section
window.addEventListener('DOMContentLoaded', prepareSetup);


// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- SCROLL FUNCTIONS -- -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

function checkForHTMLChanges(old_html_section,new_html_section){
    video_structure_dict[old_html_section]?.end_function?.();
    video_structure_dict[new_html_section]?.startup_function?.();
}

function toggleSections(toggleable_html_section){
    for (let section_i of video_structure_dict[toggleable_html_section].toggled_html_sections) video_structure_dict[section_i].included = !video_structure_dict[section_i].included;
}

function makeCSSSections(){
    for (let key_i of Object.keys(video_structure_dict)){
        if (video_structure_dict[key_i]['css_sections']) video_structure_dict[key_i]['css_function'] = d3.scaleThreshold().domain(video_structure_dict[key_i]['css_sections']).range(Array.from(new Array(video_structure_dict[key_i]['css_sections'].length+1), (x,i) => i));
    }
}

function getTransitionFunction(new_html_section,new_css_section){
    const animation_function = video_structure_dict[new_html_section]?.transitions?.[new_css_section]?.animation_function;
    if (animation_function) return animation_function.bind(video_structure_dict[new_html_section].transitions[new_css_section]);
    return;
}

function getResidualForTransitions(scroll_percentage){ 
    return (scroll_percentage-css_scroll_floor)/(css_scroll_max-css_scroll_floor);
}

function getResidualForCss(scroll_percentage){
    return (scroll_percentage-html_scroll_floor)/(html_scroll_max-html_scroll_floor);
}

function tweenFunction(scroll_percentage){
    updateSectionsAndFunctions(scroll_percentage);
    if (current_transition_function) current_transition_function(getResidualForTransitions(scroll_percentage));
    if (video_structure_dict[html_section].toggleable) countdown_selector.style('width',`${getResidualForCss(global_scroll_percentage)*100}%`);
}

function getCSSSection(input_html_section,scroll_percentage){
    if (!(video_structure_dict[input_html_section]['css_function'])) return 0;
    return video_structure_dict[input_html_section]['css_function'](getResidualForCss(scroll_percentage));
}

function checkForRevertingFunction(old_html_section,old_css_section){
    video_structure_dict[old_html_section]?.['transitions']?.[old_css_section]?.reverting_function?.();
}

function updateSectionsAndFunctions(scroll_percentage){
    const new_html_section = htmlFunction(scroll_percentage);
    if (new_html_section!==html_section){
        updateHTML(html_section,new_html_section);
        [html_scroll_floor,html_scroll_max] = getUpperAndLowerBounds(new_html_section,html_sections,html_list_sections);
        const new_css_section = getCSSSection(new_html_section,scroll_percentage);
        updateCSS(html_section,new_html_section,css_section,new_css_section);
        checkForRevertingFunction(html_section,css_section);
        checkForHTMLChanges(html_section,new_html_section);
        checkAndToggleSectionAdder(html_section,new_html_section);
        css_section = new_css_section;
        html_section = new_html_section;
        [css_scroll_floor,css_scroll_max] = getUpperAndLowerCssBounds(html_section,css_section);
        current_transition_function  = getTransitionFunction(html_section,css_section);
        return;
    }
    const new_css_section = getCSSSection(html_section,scroll_percentage);
    if (new_css_section !== css_section){
        updateCSS(html_section,html_section,css_section,new_css_section);
        checkForRevertingFunction(html_section,css_section);
        css_section = new_css_section;
        [css_scroll_floor,css_scroll_max] = getUpperAndLowerCssBounds(html_section,css_section);
        current_transition_function = getTransitionFunction(html_section,css_section);
    }
}

function updateHTML(old_html_section,new_html_section){
    if (old_html_section==0 || new_html_section==0) toggleStartingVals(new_html_section);
    d3.select(`.html-section-${old_html_section}`).style('display','none');
    d3.select(`.html-section-${new_html_section}`).style('display','block');
}

function updateCSS(old_html_section,new_html_section,old_css_section, new_css_section){
    if (old_html_section==new_html_section){
        d3.select(`.html-section-${old_html_section}`)
            .classed(`css-section-${old_html_section}-${old_css_section}`,false)
            .classed(`css-section-${old_html_section}-${new_css_section}`,true);
        return;
    }
    d3.select(`.html-section-${old_html_section}`)
        .classed(`html-section-${old_html_section}-css`,false)
        .classed(`css-section-${old_html_section}-${old_css_section}`,false);
    d3.select(`.html-section-${new_html_section}`)
        .classed(`html-section-${new_html_section}-css`,true)
        .classed(`css-section-${new_html_section}-${new_css_section}`,true);
}

function getUpperAndLowerBounds(input_index,section_dict,html_list=undefined){
    current_index = html_list ? html_list.indexOf(input_index) : input_index;
    if (current_index==0) return [0,section_dict[0]];
    if (html_list==undefined && current_index==section_dict.length) return [section_dict[section_dict.length-1],1];
    if (html_list && input_index==html_list[html_list.length-1]) return [section_dict[section_dict.length-1],1];
    return [section_dict[current_index-1],section_dict[current_index]];
}

function getUpperAndLowerCssBounds(html_index,css_index){
    if (!(video_structure_dict[html_index]['css_sections'])) return [html_scroll_floor,html_scroll_max];
    const current_bounds = getUpperAndLowerBounds(css_index,video_structure_dict[html_index]['css_sections']);
    const distance = html_scroll_max-html_scroll_floor;
    if (css_index==0) return [html_scroll_floor,html_scroll_floor+(current_bounds[1]*distance)];
    if (css_index==video_structure_dict[html_index]['css_sections'].length) return [html_scroll_floor+(current_bounds[0]*distance),html_scroll_max];
    return [html_scroll_floor+(current_bounds[0]*distance),html_scroll_floor+(current_bounds[1]*distance)];
}

function globalInterpolate(){
    global_scroll_percentage = Math.max(Math.min(content_obj.scrollTop / max_y_scroll, 1),0);
    global_audio_and_captions_percentage = getAudioAndCaptionsPercentage();
    tweenFunction(global_scroll_percentage);
    updateCaptions(global_audio_and_captions_percentage);
    syncAudio();
}

function toggleHTMLSectionInclusion(toggleable_html_section){
    // To do: Update the line below when done getting all the heights
    video_structure_dict[toggleable_html_section].current_toggle_selected = !video_structure_dict[toggleable_html_section].current_toggle_selected;
    toggleSections(toggleable_html_section);
    const old_max_y_scroll = max_y_scroll;
    [html_sections, html_list_sections] = makeHTMLList();
    d3.select("#scroll-wrapper").style('height',`${max_y_scroll + content_obj.clientHeight}px`);
    htmlFunction = d3.scaleThreshold().domain(html_sections).range(html_list_sections)
    updateHeightAndSpeed(old_max_y_scroll);
    d3.select('#addition-text').html(video_structure_dict[toggleable_html_section].selection_text[+video_structure_dict[toggleable_html_section].current_toggle_selected]);
    countdown_selector.classed('selected',video_structure_dict[toggleable_html_section].current_toggle_selected);
}

// need to update both scroll_duration and constant_scroll_duration
function updateHeightAndSpeed(old_max_y_scroll){
    const pxs_per_millsecond = old_max_y_scroll/scroll_duration;
    const old_multiplier = scroll_duration/constant_scroll_duration;
    scroll_duration = max_y_scroll / pxs_per_millsecond;
    constant_scroll_duration = scroll_duration/old_multiplier;
}

function makeHTMLList(){
    let html_list = [];
    let list_sections = [];
    let accumulator = 0;
    for (let item in video_structure_dict){
        if (video_structure_dict[item]['included']){
            accumulator = accumulator + video_structure_dict[item].height;
            html_list.push(accumulator);
            list_sections.push(+item)
        }
    }
    max_y_scroll = accumulator;
    html_list.pop(); // Don't need a seperate section for this last item. This is taken care with document height
    return [html_list.map(d => d/max_y_scroll),list_sections];
}

function getAudioAndCaptionsPercentage(){
    if (extra_sections_included) return global_scroll_percentage;
    if (global_scroll_percentage < 0.21935810668205036) return 0.71071 * global_scroll_percentage;
    return (0.71071 * global_scroll_percentage) + 0.28929;
}

function checkAndToggleSectionAdder(old_html_section,new_html_section){
    if (video_structure_dict[old_html_section]?.toggleable){ // on toggle end. Probably want to clean this up.
        if (!wrapper_is_progress_bar) toggleAddWrapperProgressBar();
        d3.select("#add-wrapper").classed('not-shown',true);
    }
    if (video_structure_dict[new_html_section]?.toggleable){
        d3.select("#add-wrapper").classed('not-shown',false);
        controlsTimeout(true);
    }
}

async function changeAnimationSpeed(){
    speed_multiplier = Math.round((speed_multiplier < 1.9 ? speed_multiplier+0.2 : 0.6)*10)/10;
    updateSpeed();
}

function updateSpeed(){
    scroll_duration = constant_scroll_duration / speed_multiplier;
    document.getElementById('playback-speed').innerHTML = `${speed_multiplier}x`;
    audio.playbackRate = speed_multiplier;
    sessionStorage.setItem('speed_multiplier',speed_multiplier.toFixed(1));
    if (is_playing){
        audio.pause();
        d3.select('body').interrupt();
        audio.removeEventListener('waiting',loadAudioDuringVideo);
        if (audio.readyState===4){
            play();
            return;
        }
        loadAudioDuringVideo(false);
    }
}

function visualTransition(){
    d3.select('body').transition()
        .duration((1 - global_scroll_percentage)*scroll_duration)
        .ease(d3.easeLinear)
        .tween("scroll", scrollTween(max_y_scroll))
        .on("end", stopPlaying);
}

function syncAudio(){
    if (is_playing){
        if (Math.abs(audio.currentTime - (global_audio_and_captions_percentage * audio.duration)) > audio_offset_tolerance) audio.currentTime = global_audio_and_captions_percentage * audio.duration;
        return;
    }
    audio.currentTime = global_audio_and_captions_percentage * audio.duration;
    if (is_loading) stopLoading();
}

function scrollTween(offset) {
    return function() {
        let i = d3.interpolateNumber(content_obj.scrollTop, offset);
        return function(t) { content_obj.scrollTo(0, i(t)); };
    };
}

function updateCaptions(scroll_percentage){
    const curr_captions_section = captionsFunction(scroll_percentage);
    if (captions_section!=curr_captions_section){
        updateCaptionText(curr_captions_section,captions_section);
        captions_section = curr_captions_section;
    }
};

function updateCaptionText(new_captions_section,old_captions_section=undefined){
    document.getElementById(`captions-${old_captions_section}`).style.display = 'none';
    document.getElementById(`captions-${new_captions_section}`).style.display = 'block';
}

function toggleStartingVals(next_html_section){
    if (next_html_section==0){
        d3.select("#icon-wrapper").classed('not-shown',false);
        d3.select('#es-background').classed("header-hidden",false);
        return;
    }
    d3.select("#icon-wrapper").classed('not-shown',false);
    controlsTimeout();
}

function scrollToSameLocation(){
    const old_html_percentage = getResidualForCss(global_scroll_percentage);
    global_scroll_percentage =  (Math.max(Math.min(content_obj.scrollTop / max_y_scroll, 1),0));
    [html_scroll_floor,html_scroll_max] = getUpperAndLowerBounds(html_section,html_sections,html_list_sections);
    window.scrollTo(0,(html_scroll_floor + old_html_percentage*(html_scroll_max-html_scroll_floor))*max_y_scroll);
}

// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- PLAYING AND PAUSING -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

async function play(){
    if (global_scroll_percentage>=1) return;
    document.getElementById('play-button').style.opacity=0;
    document.getElementById('pause-button').style.opacity=1;
    if (audio.readyState!==4){
        loadAudioDuringVideo(false);
        return;
    }
    audio.playbackRate = speed_multiplier;
    await audio.play();
    is_playing=true;
    visualTransition();
    audio.addEventListener('waiting',loadAudioDuringVideo,{once:true});
}

function stopPlaying(){
        document.getElementById("pause-button").style.opacity = 0;
        document.getElementById("play-button").style.opacity = 1;
        audio.pause();
        audio.currentTime = global_scroll_percentage * audio.duration; // For issues if playing and pausing to resync audio
        d3.select('body').interrupt();
        audio.removeEventListener('waiting',loadAudioDuringVideo);
        is_playing=false;
}

function stopLoading(){
    is_loading = false;
    loader_content.style('display','none');
    if (loader_timeout){
        clearTimeout(loader_timeout);
        loader_timeout = undefined;
    }
    audio.removeEventListener('canplaythrough',playAfterDelay);
}

function playAfterDelay(){
    if (loader_timeout){
        clearTimeout(loader_timeout);
        loader_timeout = undefined;
    }
    is_loading = false;
    is_playing=true;
    loader_content.style('display','none');
    play();
}

function loadAudioDuringVideo(pause=true){
    if (pause){
        audio.pause();
        d3.select('body').interrupt();
    }
    is_loading = true;
    if (audio.readyState===4){
        playAfterDelay();
    } else{
        audio.addEventListener('canplaythrough',playAfterDelay,{once:true});
        loader_timeout = setTimeout(function(){
            loader_content.style('display','flex');
            loader_timeout = undefined;
        },200);
    }
}

function playPause(){
    if (global_scroll_percentage>=1) return;
    is_playing = !is_playing;
    is_playing ? play() : stopPlaying();
};

function pauseIfPlaying(){
    if (is_playing) stopPlaying();
}


// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- GENERAL FUNCTIONS -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

function toggleSound(){
    is_muted = !is_muted;
    audio.muted = is_muted;
    document.getElementById('volume-on').style.opacity = +!(is_muted);
    document.getElementById('volume-off').style.opacity = +is_muted;
}

function toggleCaptions(){
    show_closed_captions = !show_closed_captions; 
    updateCaptionsStyling();
}

function updateCaptionsStyling(){
    d3.select('#cc-text').classed('strikethrough',!show_closed_captions);
    d3.select('#captions-wrapper').classed('captions-shown',show_closed_captions);
    sessionStorage.setItem('show_closed_captions',show_closed_captions);
}

function controlsTimeout(entry=false){
    wait = true;
    setTimeout(function(){wait = false;},200);
    if (entry){
        toggleAddWrapperProgressBar();
        full_controls_timeout = mousemove_timeout!=undefined
    } else{
        // triggered by mouse move
        if (mousemove_timeout==undefined){
            // Nothing already displayed, no current timeout
            d3.select("#icon-wrapper").classed('not-shown',false);
            d3.select('#es-background').classed("header-hidden",false);
            if (video_structure_dict[html_section].toggleable) toggleAddWrapperProgressBar();
        } else if (!full_controls_timeout){
            // Add wrapper already displayed
            d3.select("#icon-wrapper").classed('not-shown',false);
            d3.select('#es-background').classed("header-hidden",false);
        }
    }
    if (mousemove_timeout){
        clearTimeout(mousemove_timeout);
        mousemove_timeout = undefined;
    }
    mousemove_timeout = setTimeout(function(){
        full_controls_timeout = true;
        mousemove_timeout = undefined;
        if (html_section!==0){
            d3.select("#icon-wrapper").classed('not-shown',true);
            d3.select('#es-background').classed("header-hidden",true);
        }
        if (video_structure_dict[html_section].toggleable) toggleAddWrapperProgressBar();
    },2000);
}

function toggleAddWrapperProgressBar(){
    d3.select('#add-wrapper').classed('progress-bar',!wrapper_is_progress_bar);
    wrapper_is_progress_bar = !wrapper_is_progress_bar;
}

function toggleFullScreen(){ 
    if (fullscreen_index!=-1){
        fullscreen ? closeFullscreen(fullscreen_index) : openFullscreen(fullscreen_index);
    }
};

function updateSessionStorage(){
    extra_sections_included = !extra_sections_included;
    sessionStorage.setItem('extra_sections_included',extra_sections_included);
}

function fullScreenFunction(){
    fullscreen = !fullscreen;
    document.getElementById('fullscreen').style.opacity = +!fullscreen;
    document.getElementById('minimize').style.opacity = +fullscreen;    

}

function openFullscreen(input_ind) {
    if (input_ind==0) {
        document.documentElement.requestFullscreen();
    } else if (input_ind==1) {
        document.documentElement.mozRequestFullScreen();
    } else if (input_ind==2) { 
        document.documentElement.webkitRequestFullscreen();
    } else if (input_ind==3) {
        document.documentElement.msRequestFullscreen();
    }
}

function closeFullscreen(input_ind) {
    if (input_ind==0) {
        document.exitFullscreen();
    } else if (input_ind==1) {
        document.mozCancelFullScreen();
    } else if (input_ind==2) {
        document.webkitExitFullscreen();
    } else if (input_ind==3) {
        document.msExitFullscreen();
    }
}

function getFullScreenIndices() {
    if (document.documentElement.requestFullscreen) return 0;
    if (document.documentElement.mozRequestFullScreen) return 1;
    if (document.documentElement.webkitRequestFullscreen) return 2;
    if (document.documentElement.msRequestFullscreen) return 3;
    document.getElementById('player-fullscreen').style.display ='none';
    return -1;
}

function getAudioAndCaptionsPercentage(){
    if (extra_sections_included) return global_scroll_percentage;
    if (global_scroll_percentage < 0.21935810668205036) return 0.71071 * global_scroll_percentage;
    return (0.71071 * global_scroll_percentage) + 0.28929;
}

function getScreenTypeForEarnerTransitions(){
    if (window.matchMedia('(orientation:portrait) and (max-width:350px)').matches) return 'small_smartphone';
    if (window.matchMedia('(orientation:portrait) and (max-width:500px)').matches) return 'normal_smartphone';
    if (window.matchMedia('(orientation:landscape) and (max-height:500px)').matches) return 'landscape_smartphone';
    if (window.matchMedia('(min-width: 1165px) and (min-height:665px)').matches) return'large_desktop';
    if (window.matchMedia("(max-width:834px)").matches) return 'small_screen';
    return 'desktop';
}

// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- SETUP AND EVENT LISTENERS -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

function declarations(){
    resizingEventListeners();
    document.querySelectorAll('.toggleable').forEach(e => {e.addEventListener(down_string, mousedownNum)});
    makeCSSSections();
}

function prepareSetup(){
    if (isIE()){
        document.getElementById('title-wrapper').style.display = 'none';
        document.getElementById('scroll-wrapper').style.display = 'none';
        document.getElementById('ie-issues').style.display = 'flex';
        return;
    }
    declarations();
    if (extra_sections_included){
        document.getElementById("toggle-time").checked = true;
        toggleHTMLSectionInclusion(4);
    }
    if (show_closed_captions) updateCaptionsStyling();
    toolbarChanges();
    loadAudio();
    setup();
}

function loadAudio(){
    audio.load();
    audio.addEventListener('loadedmetadata',metadataLoaded,{once:true});
}

function metadataLoaded(){
    has_loaded_metadata = true;
    if (has_loaded_data) stopLoadingAndShowContent();
}

function toolbarChanges(){
    if (has_toolbar != (d3.select('#percent').style('height') != d3.select('#vh').style('height'))){
        has_toolbar = !has_toolbar;
        content_obj = has_toolbar ? document.getElementById('content') : document.documentElement;
        if (has_toolbar){
            d3.select(window).on("scroll.scroller", null);
            d3.select('body').style('overflow','hidden');
            d3.select('#content').style('position','fixed').style('overflow-y','scroll');
        } else{
            d3.select('#content').on("scroll.scroller", null);
            d3.select('body').style('overflow','initial');
            d3.select('#content').style('position','initial').style('overflow-y','initial');
        }
    }
    d3.select("#scroll-wrapper").style('height',`${max_y_scroll + content_obj.clientHeight}px`);
}

async function setup(){
    await loadPlottingData();
    d3.select(has_toolbar ? '#content' : window).on("scroll.scroller", globalInterpolate);    
    loadFinalVideos();
    has_loaded_data = true;
    if (has_loaded_metadata) stopLoadingAndShowContent();
}

function stopLoadingAndShowContent(){
    if (!already_loaded_page){
        if (speed_multiplier !== 1) updateSpeed();
        globalInterpolate();
        controlsListeners();
        already_loaded_page = true;
        loader_content.style('display','none');
        d3.select('#captions-wrapper').style('display','block');
        d3.selectAll('.initially-hidden').classed('initially-hidden',false);
    }
}

async function loadPlottingData(){
    histogram_data = await d3.json('processed_data/histogram_data.json');
    max_histogram_data = makeMaxData(histogram_data);
    density_data = await d3.json('processed_data/density_data.json')
}

function controlsListeners(){
    if (fullscreen_index != -1){
        document.addEventListener('webkitfullscreenchange', fullScreenFunction)
        document.addEventListener('mozfullscreenchange', fullScreenFunction)
        document.addEventListener('fullscreenchange', fullScreenFunction)
        document.addEventListener('MSFullscreenChange', fullScreenFunction);
    } 
    window.addEventListener('wheel',pauseIfPlaying);
    window.addEventListener("mousedown", (e) =>{
        if (e.offsetX > document.body.clientWidth && is_playing) stopPlaying();
    });
    document.querySelectorAll('.summary-link').forEach(e=>{
        e.addEventListener(down_string,pauseIfPlaying);
    });
    document.addEventListener(down_string,function(){ if (!wait && html_section!=0) controlsTimeout()});
    window.addEventListener('touchmove',pauseIfPlaying);
    document.getElementById('player-speed').addEventListener(down_string,changeAnimationSpeed);
    document.getElementById('closed-caption').addEventListener(down_string,toggleCaptions)
    document.getElementById('player-wrapper').addEventListener(down_string,playPause);
    document.getElementById('player-sound').addEventListener(down_string,toggleSound);
    document.getElementById('player-fullscreen').addEventListener(down_string,toggleFullScreen);
    document.getElementById('github-link-wrapper').addEventListener(down_string,pauseIfPlaying);
    document.addEventListener('keydown',function(e){
        if (e.key===' '){
            e.preventDefault();
            playPause();
            if (!wait && html_section!=0) controlsTimeout();
        } else if (e.key==='m' && html_section!=0){
            if (!wait) controlsTimeout();
            toggleSound();
        } else if (e.key==='c' && html_section!=0){
            if (!wait) controlsTimeout();
            toggleCaptions();
        } else if (e.key==='f' && html_section!=0){
            if (!wait) controlsTimeout();
            toggleFullScreen();
        } else if (e.key.toLowerCase() == 'arrowdown' || e.key.toLowerCase() =='arrowup'){
            pauseIfPlaying();
        }
    });
    document.addEventListener('mousemove',function(){
        if (!wait && html_section!=0) controlsTimeout();
    });
    // when you click on a link, it pauses the video
    d3.selectAll('.link-wrapper').on(down_string,pauseIfPlaying);

    document.getElementById('toggle-time').addEventListener('change',function(){
        toggleHTMLSectionInclusion(html_section);
        updateSessionStorage();
        scrollToSameLocation();
    })
};

// -- -- -- -- -- -- -- -- --
// -- -- RESIZING -- -- 
// -- -- -- -- -- -- -- -- --


function resize(){
    toolbarChanges();
    d3.select(has_toolbar ? '#content' : window).on("scroll.scroller", globalInterpolate);    
    is_small = window.matchMedia("(max-width:834px)").matches;
    small_translate = is_small ? 'translateY(' : 'translateX(-';
    density_inner =  window.matchMedia("(orientation:portrait)").matches ?'mobile':'desktop';
    audio_offset_tolerance = is_small ? 0.75 : 0.5;
    screen_type = getScreenTypeForEarnerTransitions();
    inner_width = window.innerWidth;
    set_up_plot = true;
    set_up_densities = true;
    checkForHTMLChanges(html_section,html_section);
    if (current_transition_function){
        video_structure_dict[html_section]?.['transitions']?.[css_section]?.resizing_function?.();
        current_transition_function(getResidualForTransitions(global_scroll_percentage));
    }
}

function prepareResize(){
    if (resize_timeout){
        clearTimeout(resize_timeout);
        resize_timeout = undefined;
    }
    just_resized = true;
    resize();
    resize_timeout = setTimeout(function(){
        just_resized = false;
        resize_timeout = undefined;
    },100);
}

function prepareOrientationChange(){
    if (!just_resized) resize();
}

function resizingEventListeners(){
    window.onresize = prepareResize;
    window.onresize = prepareOrientationChange;
}

// -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- 
// -- -- CUSTOM JS FOR SECTIONS -- -
// -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- 

// -- -- -- -- -- -- -- -- -- -- -- 
// HTML sections 5 and 8 - allow scrolling of means and medians
// -- -- -- -- -- -- -- -- -- -- -- 

function mousedownNum(e) {
    const this_id_vals = this.id.split('-');
    const group_index =  +this_id_vals[1];
    const entry_index =  +this_id_vals[2];
    const y_position = down_string == 'mousedown' ? e.y : e.changedTouches[0].pageY;
    let num_start = html_section==5 ? mean_vals[group_index][entry_index] : median_vals[group_index][entry_index];
    num_start = isNaN(num_start) ? 0 : num_start;
    d3.select("body").style("cursor","row-resize");
    d3.select('.html-section-5').classed('no-selection',true);
    let custom_start_function = mousemoveNum.bind(null,group_index,entry_index,this,y_position,num_start,down_string=='mousedown');
    let custom_end_function = mouseupNum.bind(null,custom_start_function);
    current_comparing_index = html_section==5 ? 0 : 1;
    window.addEventListener(move_string, custom_start_function,{passive:false});
    window.addEventListener(end_string, custom_end_function,{passive:false});
}

function restoreIncomes(){
    if (html_section===5){
        d3.selectAll('.boomer-example-income').html('$50k');
        d3.select("#updating-mean-0").html("Mean: $50k");
        d3.select("#updating-mean-1").html("Mean: $52k");
    } else{
        d3.select(".three-lowest-updated").html("$0k");
        d3.select(".three-highest-boomers").html("$50k");
        d3.select("#updating-median-0").html("Median: $50k");
        d3.select("#updating-median-1").html("Median: $40k");
    }
    if (comparitor_indices[current_comparing_index]!=og_comparitor_indices[current_comparing_index]){
        d3.select(`.comparitor${comparitor_indices[current_comparing_index]}`).style('display','none');
        d3.select(`.comparitor${og_comparitor_indices[current_comparing_index]}`).style('display','inline-block');
        comparitor_indices[current_comparing_index]=og_comparitor_indices[current_comparing_index]
    }
    d3.selectAll('.mean-example-div-2').html('$50k');
    d3.select('.millennial-1-final').html('$100k');
    incomes_restored = true;
    incomes_event_listener = false;
}

function restoreIncomesEventListener(){
    if (!incomes_event_listener){
        if (has_toolbar){
            document.getElementById('content').addEventListener("scroll",restoreIncomes,{once:true});
        } else {
            window.addEventListener("scroll",restoreIncomes,{once:true});
        }
        incomes_event_listener = true;
    }
}

function mousemoveNum(group_index,entry_index,this_obj,y_position,num_start,is_mouse,e) {
    pauseIfPlaying();
    restoreIncomesEventListener();
    if (!is_mouse) e.preventDefault();
    const new_y = is_mouse ? e.y : e.changedTouches[0].pageY;
    const diff = y_position - new_y;
    let new_toggle_val = num_start + diff;
    new_toggle_val = new_toggle_val > max ? max : new_toggle_val;
    new_toggle_val = new_toggle_val < 0 ? 0 : new_toggle_val;
    new_toggle_val = Math.round(new_toggle_val);
    this_obj.innerHTML = `$${new_toggle_val}k`;
    if (html_section==5){
        mean_vals[group_index][entry_index] = new_toggle_val;
    } else{
        median_vals[group_index][entry_index] = new_toggle_val;
    }
    updateBottomInfo(group_index);
    incomes_restored = false;
}

function mouseupNum(custom_function,e) {
    window.removeEventListener(move_string, custom_function);
    window.removeEventListener(end_string, custom_function);
    d3.select("body").style("cursor",null);
    d3.select('.html-section-5').classed('no-selection',false);
}

function updateBottomInfo(updating_index){
    if (html_section==5){
        var current_mean = mean_vals[updating_index].reduce((a, b) => a + b, 0) / (mean_vals[updating_index].length);
        means[updating_index] = current_mean;
        var difference = means[0] - means[1];
    } else{
        var current_median = getThirdHighest(median_vals[updating_index]);
        medians[updating_index] = current_median;
        var difference = medians[0] - medians[1];
    }
    const new_index = difference==0 ? 0 : difference/(Math.abs(difference));
    if (new_index!=comparitor_indices[current_comparing_index]){
        d3.select(`.comparitor${comparitor_indices[current_comparing_index]}`).style('display','none');
        d3.select(`.comparitor${new_index}`).style('display','inline');
        comparitor_indices[current_comparing_index] = new_index;
    }
    if (html_section==5){
        document.getElementById(`updating-mean-${updating_index}`).innerHTML = `Mean: $${Math.round(current_mean)}k`;
    } else{
        document.getElementById(`updating-median-${updating_index}`).innerHTML = `Median: $${Math.round(current_median)}k`;
    }
}
 
// Used to get median
function getThirdHighest(input_array){
    return [...input_array].sort((a,b) =>  a - b )[2];
}

// -- -- -- -- -- -- -- -- -- -- -- 
// HTML section 10 - animating density lines
// -- -- -- -- -- -- -- -- -- -- -- 

function drawing_function_10(input_percentage){
    if (this.density_inner_string!== density_inner){
        this.svg_selector = d3.select(`#${density_inner}-path-${this.index}`);
        this.svg_length = this.svg_selector.node().getTotalLength();
        this.svg_selector.attr('stroke-dasharray',this.svg_length);
        this.svg_selector.attr('stroke-dashoffset',this.svg_length);
        this.density_inner_string=density_inner;
    }
    this.svg_selector.attr('stroke-dashoffset',this.svg_length - (this.svg_length * input_percentage));
}

function drawing_reverting_function_10(){
    this.density_inner_string = undefined;
    this.svg_selector.attr('stroke-dasharray',null);
    this.svg_selector.attr('stroke-dashoffset',null);
}

// -- -- -- -- -- -- -- -- -- -- -- 
// HTML Sections 12 - 23 Histogram and density plots functions
// -- -- -- -- -- -- -- -- -- -- -- 

function getXTickNumber(){
    if (window.matchMedia("(min-width:900px)").matches) return 10000;
    if (small_width) return 40000;
    return 20000;
}

function getYTickNumber(plot_type){
    if (plot_type=='density') return 0;
    if (very_small_height){
        if (!plotting_histogram_proportions) return 2;
        return 1;
    }
    if (small_height){
        if (!plotting_histogram_proportions) return 3;
        return 2;
    }
    if (plotting_histogram_proportions) return 6;
    return 8;
}

function xTickFunction(d){
    if (d==0) return "$0";
    const rounded_num = Math.round(d / 1000);
    return addCommasToK(rounded_num);
}

function yTickFunction(d,bin_width){
    if (d==0) return "0";
    if (plotting_histogram_proportions){
        if (bin_width==10000 || bin_width == 5000) return `${Math.round(d*100)}%`;
        return `${Math.round(d*1000)/10}%`;
    }
    const rounded_num = Math.round(d / 1000000);
    if (small_height) return `${rounded_num}m`
    return `${rounded_num}m`
}

function getWidthAndHeight(){
    const boundingBox = document.getElementById('plot-wrapper').getBoundingClientRect();
    return [boundingBox.width,boundingBox.height];
}

function getMargins(){
    if (very_small_height) return {top: 0, right: 40, bottom: 50, left: 100};
    if (is_small) return {top: 0, right: 25, bottom: 50, left: 75};
    return {top: 5, right: 40, bottom: 70, left: 85};
}

function getAdjustedWidthAndHeight(margin_dict){
    const adjusted_width = svg_width - (margin_dict.left + margin_dict.right);
    const adjusted_height = svg_height - (margin_dict.top + margin_dict.bottom);
    return [adjusted_width,adjusted_height]
}

function getPlotInfo(){
    small_width =  window.matchMedia("(max-width:500px)").matches;
    small_height = window.matchMedia("(max-height:625px)").matches;
    very_small_height =  window.matchMedia("(max-height:500px)").matches;
    [svg_width,svg_height] = getWidthAndHeight();
    margins = getMargins();
    [adjusted_width,adjusted_height] = getAdjustedWidthAndHeight(margins);
    const plot_wrapper_bounding_box = document.getElementById('plot-wrapper').getBoundingClientRect();
    plot_wrapper_x = plot_wrapper_bounding_box.x;
    plot_wrapper_y = plot_wrapper_bounding_box.y;
    const legend = d3.select('#legend');
    legend.style('right',`${margins.right}px`);
    small_height ? legend.style('top','-20px') : legend.style('top','0px');
    x_scale =  getXScale();
    set_up_plot = false;
}

function getDensityInfo(){
    const density_y_max = Math.max(d3.max(density_data.boomers.densities),d3.max(density_data.millennials.densities)) + 0.000002;
    density_y_scale = d3.scaleLinear().domain([0, density_y_max]).range([adjusted_height, 0]);
    scaled_global_thresholds = scaleThresholds();
    scaled_curve_data = {
        'boomers': density_data['boomers'].densities.map(d=>density_y_scale(d)),
        'millennials': density_data['millennials'].densities.map(d=>density_y_scale(d)),
    };
    density_tooltip.style("top", `${plot_wrapper_y + margins.top}px`);
    if (very_small_height){
        generation_tooltip_selectors['millennials'].html("");
        generation_tooltip_selectors['boomers'].html("");
    } else{
        density_tooltip_top.html('Percentiles:');
    }
    triangleAreaTextPositioning(density_y_max);
    set_up_densities = false;
}

function getXScale(){
    return d3.scaleLinear().range([ 0, adjusted_width ]).domain([0,x_axis_max_income]);
}

function getHistogramYScale(bin_width){
    const key_name = plotting_histogram_proportions ? 'p' : 'n';
    const histogram_y_max = d3.max(histogram_data[bin_width], d => d[key_name]) + histogram_y_max_dict[bin_width][key_name];
    return d3.scaleLinear().domain([0, histogram_y_max]).range([ adjusted_height, 0]);
}

function getHistogramInfo(bin_width){
    histogram_y_scale = getHistogramYScale(bin_width);
    bar_width = x_scale(bin_width)*0.97;
    width_4850 = bar_width/2
    width_150 = x_scale(150);
    histogram_tooltip.classed('center-arrow',true).classed('left-arrow',false).classed('right-arrow',false);
    tooltip_alignment = 'center';
    if (!(small_width || small_height)) histogram_tooltip.style('transform',`translate(calc(-50% + ${x_scale(bin_width/2)}px),calc(-100% - 10px))`);
}

function initialHistogramSetup(bin_width){
    histogram_tooltip.style("opacity", 0);
    makeHistogram(bin_width);
}

function makeHistogram(bin_width){
    if (set_up_plot) getPlotInfo();
    svgSetup();
    getHistogramInfo(bin_width);
    plotHistogram(bin_width);
}

function generationToString(input_data,input_generation,bin_width){
    const curr_type = plotting_histogram_proportions ? 'p' : 'n';
    const curr_num = input_data.length==1 ? input_data[0][curr_type] : input_data.filter(d=>d.generation==input_generation)[0][curr_type];
    if (plotting_histogram_proportions){
        if (bin_width<1000) return `${ (curr_num*100).toFixed(3) }% of ${input_generation}`
        if (bin_width<1000) return `${ (curr_num*100).toFixed(2) }% of ${input_generation}`
        return `${ (curr_num*100).toFixed(1) }% of ${input_generation}`
    }
    if (curr_num>=1000000) return `${Math.round(curr_num / 100000)/10}m ${input_generation}`;
    return `${roundToK(curr_num)} ${input_generation}`
}

function roundToK(input_num,include_decimal){
    if (input_num==0) '0';
    if (include_decimal) return `${Math.round(input_num / 100)/10}k`
    return `${Math.round(input_num / 1000)}k`
}

function makeTooltipHTML(filtered_bin_data,include_bin_limits,bin_width){
    const initial_string = include_bin_limits ? `$${roundToK(+filtered_bin_data[0].min_income,bin_width==100)} - $${roundToK((+filtered_bin_data[0].min_income)+bin_width,bin_width==100)}<br>` : '';
    const boomer_string = generationToString(filtered_bin_data,'boomers',bin_width);
    if (currently_including_millennials){
        const millennial_string = generationToString(filtered_bin_data,'millennials',bin_width);
        return `${initial_string}${boomer_string}<br>${millennial_string}`; 
    }
    return `${initial_string}${boomer_string}`;
}

function getYAxisLabel(plot_type){
    if (plot_type=='density') return "Density"
    if (very_small_height) return plotting_histogram_proportions ? 'Perc.' : 'Count';
    if (small_height) return plotting_histogram_proportions ? 'Perc. of workers' : 'Num workers';
    if (plotting_histogram_proportions) return 'Percentage of workers';
    return 'Number of workers';
}

function getAdjustmentLeftAmount(plot_type){
    if (plot_type==='density') return 55;
    if (very_small_height) return 30;
    return 18;
}

function addAxisText(outer_svg,plot_type){
    const y_axis_text = getYAxisLabel(plot_type);
    outer_svg.append('text')
        .attr('class','axes axis-label x-axis-label x-axis-info opacity-transition')
        .attr('dominant-baseline',`central`)
        .attr("transform", `translate(${margins.left + (adjusted_width/2)}, ${svg_height - (margins.bottom/2) + 13.5})`)
        .text('Annual income (2019 dollars)');
    outer_svg.append("text")
        .attr('class','axes axis-label y-axis-label y-axis-info opacity-transition')
        .attr('transform',function(){
            const rotating_string = very_small_height ? '' : 'rotate(-90)'
            const adjust_left_amount = getAdjustmentLeftAmount(plot_type);
            return `translate(${adjust_left_amount},${margins.top+adjusted_height/2}) ${rotating_string}`
        })
        .text(y_axis_text);   
}

function getComparisonString(d,generation_string,bin_width){
    if (bin_width!=10000) return `histogram-bar ${generation_string}-bar opacity-transition`;
    let highest_boomer_string = '';
    let middle_boomer_string = '';
    let highlight_comparison_string = '';
    if (generation_string=='boomers'){
        if (d.min_income==30000) highest_boomer_string = 'highest';
        if (d.min_income>=20000 && d.min_income < 60000) middle_boomer_string = 'middle';
    }
    if (d.min_income==40000) highlight_comparison_string = generation_string == 'boomers' ? 'boomers-highlight-comparison' : 'millennials-highlight-comparison';
    return `${highest_boomer_string} ${middle_boomer_string} ${highlight_comparison_string} histogram-bar ${generation_string}-bar opacity-transition`;
}

function makeHistogramBars(filtered_data,input_str,bin_width){
    svg_plotting_group.selectAll(`.${input_str}-histogram-bar`)
        .data(filtered_data)
        .enter()
        .append("rect")
            .attr('class',d=>getComparisonString(d,input_str,bin_width))
            .attr("x", d=>x_scale(d.min_income)+width_150)
            .attr("y", d=>{
                return plotting_histogram_proportions ? histogram_y_scale(d.p) : histogram_y_scale(d.n);
            })
            .attr("width", bar_width)
            .attr("height", d  =>{
                const y_amount  = plotting_histogram_proportions ? histogram_y_scale(d.p) : histogram_y_scale(d.n);
                return adjusted_height - y_amount;
            });

}

function makeMaxData(all_data){
    const max_data = {};
    for (let type_i of [10000,5000,1000,100]){
        max_data[type_i] = [];
        const curr_type_subset = all_data[type_i];
        for (let i=0;i<x_axis_max_income;i=i+type_i){
            const curr_subset = curr_type_subset.filter(d=> d.min_income === i);
            const curr_n_max = d3.max(curr_subset,d=>d.n);
            const curr_p_max = d3.max(curr_subset,d=>d.p);
            max_data[type_i].push({'min_income':i,'n':curr_n_max,'p':curr_p_max});
        }
    }
    return max_data;
}

function findClosest(arr,target){
    let diff = Math.abs(target - arr[0]);
    let index = 0;
    for (let val = 0; val < arr.length; val++) {
        let newdiff = Math.abs(target - arr[val]);
        if (newdiff > diff) return index;
        if (diff > newdiff){
            diff = newdiff;
            index = val;
        }
    };
    return index;
}

function addHoverRect(){
    d3.select('#plot-wrapper').append("div")
        .attr('id','hover-rect')
        .attr("class",'remove-on-new-plot')
        .style("left",`${margins.left}px`)
        .style("top",`${margins.top}px`)
        .style("position",'absolute')
        .style("width", `${adjusted_width}px`)
        .style("height", `${adjusted_height}px`);
}

function updateTooltipHTML(scaled_income,generation_list){
    if (very_small_height){
        density_tooltip_top.html(`$${roundToK(scaled_income)}`);
        return;
    }
    for (let generation_str of generation_list){
        const closest_index = findClosest(density_data[generation_str].incomes,scaled_income);
        if (closest_index != density_tooltip_indices[generation_str]){
            generation_tooltip_selectors[generation_str].html(`${generation_str[0].toUpperCase() + generation_str.slice(1)} &asymp; ${(closest_index+1)*2}`);
            density_tooltip_indices[generation_str] = closest_index;
        }
    }
}

function setupDensityTooltip(scaled_income,unscaled_income,generation_list){
    updateTooltipHTML(scaled_income,generation_list);
    const curr_left = unscaled_income+plot_wrapper_x + margins.left;
    density_tooltip.style('left', `${curr_left + 5}px`).classed('transform-right', curr_left >= inner_width/2);
}

function densityHoverRect(generation_list){
    addHoverRect();
    d3.select('#hover-rect')
        .on(density_hover_start,function(d){
            let unscaled_x =  has_mouse ? d.clientX : d.changedTouches[0].pageX;
            unscaled_x = unscaled_x - (plot_wrapper_x + margins.left);
            unscaled_x = Math.min(Math.max(0,unscaled_x),adjusted_width);
            const scaled_x = x_scale.invert(unscaled_x);
            setupDensityTooltip(scaled_x,unscaled_x,generation_list);
            d3.select('#legend').style('opacity',0);
            d3.select('.plotting-line').style('opacity',1).attr('x1',`${unscaled_x}px`).attr('x2',`${unscaled_x}px`);
            density_tooltip.style("opacity", 1);
        })
        .on(density_hover_end, densityHoverEnd);
}

function densityHoverEnd(){
    d3.select('.plotting-line').style('opacity',0);
    d3.select('#legend').style('opacity',1);
    density_tooltip.style("opacity", 0);
}

function histogramHoverRect(max_data,all_data,current_type){
    addHoverRect();
    d3.select('#hover-rect')
        .on(density_hover_start,function(d){
            let unscaled_x =  has_mouse ? d.clientX : d.changedTouches[0].pageX;
            unscaled_x = unscaled_x - (plot_wrapper_x + margins.left);
            let curr_x = x_scale.invert(unscaled_x)-150;
            curr_x = Math.max(Math.min(x_axis_max_income-current_type,curr_x),0);
            const bin_min_income = curr_x - (curr_x % current_type);
            const max_string = plotting_histogram_proportions ? 'p' : 'n';
            const scaled_bin_height = histogram_y_scale(max_data.filter(d=>d.min_income==bin_min_income)[0][max_string]);
            const bin_data = all_data.filter(d=>d.min_income == String(bin_min_income));
            const curr_html = makeTooltipHTML(bin_data,!very_small_height,current_type);
            changeTooltipCentering(histogram_tooltip,bin_min_income,tooltip_alignment);
            updateTooltipPosition(bin_min_income,scaled_bin_height,curr_html);
        })
        .on(density_hover_end, function(d){
            histogram_tooltip.style("opacity", 0);
        });
}

function updateTooltipPosition(min_income,y_height,current_html){
    histogram_tooltip
        .style("opacity", 1)		
        .style("left",`${plot_wrapper_x + margins.left + x_scale(min_income+150)}px`)
        .style("top", `${plot_wrapper_y + margins.top  + y_height}px`)
        .html(current_html);
    }

function changeTooltipCentering(tooltip_selector,income_bin,current_alignment){
    if (small_width || small_height){
        const new_tooltip_alignment = income_bin >= x_axis_max_income/2 ? 'right' : 'left';
        if (new_tooltip_alignment !== current_alignment){
            new_tooltip_alignment==='left' ? tooltip_selector.style('transform',`translate(${width_4850-15}px,calc(-100% - 10px))`) : tooltip_selector.style('transform',`translate(calc(-100% + ${width_4850 + 15}px),calc(-100% - 10px))`);
            tooltip_selector.classed(`${tooltip_alignment}-arrow`,false).classed(`${new_tooltip_alignment}-arrow`,true);                    
            tooltip_alignment = new_tooltip_alignment;
        }
    }
}

function makePlottingSvgs(){
    const outer_svg = d3.select("#plot-wrapper")
        .append("svg")
            .attr('id','svg-plot')
            .attr('class','remove-on-new-plot')
            .attr("width", svg_width)
            .attr("height", svg_height);
    const svg_plotting_group = outer_svg.append("g").attr("transform", `translate(${margins.left},${margins.top})`);
    return [outer_svg,svg_plotting_group];
}

function appendXAxis(){
    return svg_plotting_group.append("g").attr('class','axes x-axis x-axis-info opacity-transition').attr('transform',`translate(0,${adjusted_height})`);
}

function appendYAxis(){
    return svg_plotting_group.append("g").attr('class','axes y-axis y-axis-info opacity-transition');
}

function makeAxes(type,bin_width=10000){
    const y_scale = type=='histogram' ? histogram_y_scale : density_y_scale;
    const x_tick_number =  getXTickNumber();
    const y_tick_number = getYTickNumber(type);
    // X axis
    appendXAxis()
        .call(d3.axisBottom(x_scale)
            .ticks(135000/x_tick_number)
            .tickSizeOuter(0)
            .tickFormat(d => xTickFunction(d)));
    // Y axis
    y_axis_ticks_selector = appendYAxis()
        .call(d3.axisLeft(y_scale)
            .tickSizeOuter(0)
            .ticks(y_tick_number)
            .tickFormat(d=>yTickFunction(d,bin_width))
        )
    addAxisText(outer_svg,type);
}

function plotHistogram(bin_width){
    // Boomer bars
    const boomer_data = histogram_data[bin_width].filter(d=> d.generation == 'boomers');
    makeHistogramBars(boomer_data,'boomers',bin_width);
    if (currently_including_millennials){
        makeHistogramBars(histogram_data[bin_width].filter(d=> d.generation == 'millennials'),'millennials',bin_width);
        histogramHoverRect(max_histogram_data[bin_width],histogram_data[bin_width],bin_width)
        setLegendStyle(['boomers','millennials']);
    } else{
        histogramHoverRect(boomer_data,boomer_data,bin_width);
        setLegendStyle(['boomers']);
    }
    makeAxes('histogram',bin_width);
}

function updateHistogram(old_y_scale,new_y_scale,proportion){
    svg_plotting_group.selectAll(`.histogram-bar`)
            .attr("y", d => {
                //return new_y_scale(d.proportion)
                return (((1-proportion)*old_y_scale(d.n)) + (proportion*new_y_scale(d.p)));
            })
            .attr("height", d  => {
                //return adjusted_height - new_y_scale(d.proportion)
                return (adjusted_height - (((1-proportion)*old_y_scale(d.n)) + (proportion*new_y_scale(d.p))));
            });
}

function setLegendStyle(input_list){
    d3.select('#millennial-legend-wrapper').style("opacity", +input_list.includes('millennials'));
    d3.select('#boomer-legend-wrapper').style("opacity",+input_list.includes('boomers'));
    d3.select("#legend").style('height','50px');

}

function scaleThresholds(){
    return unscaled_tholds.map(d=>x_scale(d));
}

function svgSetup(){
    if (already_made_plot) d3.selectAll('.remove-on-new-plot').remove();
    [outer_svg,svg_plotting_group] = makePlottingSvgs();
    already_made_plot = true;
}

function densitySetup(){
    if (set_up_plot) getPlotInfo();
    if (set_up_densities) getDensityInfo();
    histogram_tooltip.style("opacity", 0);
    densityHoverEnd();
    svgSetup();
}


function makeDensityPlot(type_list){
    densitySetup();
    drawDensityPlot(type_list);
    makeAxes('density');
    addDensityLine();
    densityHoverRect(type_list);
    setLegendStyle(type_list);
}

function addDensityLine(){
    svg_plotting_group
        .append('line')
        .attr('class','plotting-line')
        .attr('y1',adjusted_height)
}


function makeClipPaths(){
    svg_plotting_group.append('clipPath')
        .attr("id",`density-clip`)
        .append('rect')
        .attr("id",`density-clip-rect`)
        .attr("width", `0px`)
        .attr("height", `${adjusted_height}px`);

    svg_plotting_group.append('clipPath')
        .attr("id",`histogram-clip`)
        .append('rect')
        .attr("id",`histogram-clip-rect`)
        .attr("width", `${adjusted_width}px`)
        .attr("height", `${adjusted_height}px`);

    d3.selectAll(`.histogram-bar`).attr("clip-path",`url(#histogram-clip)`);
    d3.selectAll('.density-curve').attr('clip-path','url(#density-clip)');
}


function drawDensityPlot(generation_list){
    for (let generation_str of generation_list){
        svg_plotting_group.append('path')
            .datum(scaled_curve_data[generation_str])
            .attr('class',`${generation_str}-curve density-curve`)
            .attr("d", d3.area()
                    .curve(d3.curveBasis)
                    .x((d,i) => scaled_global_thresholds[i])
                    .y1(d=>d)
                    .y0(adjusted_height)
            );
    }
}

function makeTriangleAxes(){
    const y_scale = d3.scaleLinear().domain([0, 0.000013459579583107776]).range([ adjusted_height, density_y_scale(0.000013459579583107776)]);
    const inner_x_scale = d3.scaleLinear().domain([0, 50000]).range([ 0, x_scale(50000)]);
    // X axis
    appendXAxis().call(d3.axisBottom(inner_x_scale)
        .tickValues([0, 50000]))
    // Y axis
    appendYAxis().call(d3.axisLeft(y_scale)
            .tickValues([0, 0.000013459579583107776])
            .tickFormat(d=> d == 0 ?  '0' : `${Math.round(d * 10000000)/100}e-5`));
}

function drawTriangle(location){
    const adjustment_amount = location == 'left' ? 50000 : 0;
    const triangle_points = [{"x":50000-adjustment_amount, "y":0.000013459579583107776},{"x":50000-adjustment_amount,"y":0},{"x":100000-adjustment_amount,"y":0}];
    const scaled_triangle_points = triangle_points.map(d=>`${x_scale(d.x)+margins.left},${density_y_scale(d.y) + margins.top}`).join(' ');
    // append to inner svg
    outer_svg
        .append("polygon")
        .attr("id",'triangle-example')
        .attr('class','opacity-transition')
        .attr("points",scaled_triangle_points);
}

function makeOpacityRects(){
    svg_plotting_group.selectAll('highlight-rect')
        .data([{'x0':36500,'x1':140000},{'x0':0,'x1':90000}])
        .enter()
        .append("rect")
        .attr("x",d=>x_scale(d.x0))
        .attr("width", d=>x_scale(d.x1-d.x0))
        .attr("height", adjusted_height)
        .attr('class',d=>{
            const id_string = d.x0 === 0 ? 'upper-comparison' : 'lower-comparison';
            return `${id_string} highlight-rect opacity-transition`;
        })
}

function triangleAreaTextPositioning(){
    let left_amount = 50000;
    let top_amount = 0.00000675;
    if (very_small_height){
        left_amount = 20000;
        top_amount = 0.000012;
    }
    d3.select('#triangle-area-text')
        .style('left',`${margins.left + x_scale(left_amount)}px`)
        .style("top",`${margins.top + density_y_scale(top_amount)}px`);
}

function getBaselineAdjustment(){
    if (very_small_height) return 5000;
    if (small_width) return 10000;
    return 3000;
}

function makeArrowLines(){

    outer_svg
        .append('defs')
        .append("marker")
        .attr("id","arrow")
        .attr('class','marker-icon')
        .attr("viewBox","0 -5 10 10")
        .attr("refX",5)
        .attr("refY",0)
        .attr("markerWidth",4)
        .attr("markerHeight",4)
        .attr("orient",'auto')
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    outer_svg
        .append('defs')
        .append("marker")
        .attr("id","arrow-start")
        .attr('class','marker-icon')
        .attr("viewBox","0 -5 10 10")
        .attr("refX",5)
        .attr("refY",0)
        .attr("markerWidth",4)
        .attr("markerHeight",4)
        .attr("orient",'auto-start-reverse')
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    const baseline_adjustment = getBaselineAdjustment();

    const millennial_data = [{'x': 30000, 'y': density_data.millennials.densities[15]},{'x':20000-baseline_adjustment,'y': density_data.millennials.densities[15]},{'x':20000-baseline_adjustment,'y': density_data.millennials.densities[10]},{'x':20000,'y': density_data.millennials.densities[10]}];
    
    svg_plotting_group
        .append('path')
        .datum(millennial_data)
        .attr('class','comparison-1 example-line opacity-transition')
        .attr('d',d3.line()
            .x(d=>x_scale(d.x))
            .y(d=>density_y_scale(d.y))
        )
        .attr('marker-end','url(#arrow)')
        .attr('marker-start','url(#arrow-start)');

    const comparison_data = [{'x': 60000, 'y': density_data.boomers.densities[30]},{'x':60000+baseline_adjustment,'y': density_data.boomers.densities[30]},{'x':60000+baseline_adjustment,'y': density_data.millennials.densities[30]},{'x':60000,'y': density_data.millennials.densities[30]}];

    svg_plotting_group
        .append('path')
        .datum(comparison_data)
        .attr('class','comparison-2 example-line opacity-transition')
        .attr('d',d3.line()
            .x(d=>x_scale(d.x))
            .y(d=>density_y_scale(d.y))
        )
        .attr('marker-end','url(#arrow)')
        .attr('marker-start','url(#arrow-start)');
}

function highlight50to100(){
    svg_plotting_group.append('clipPath')
        .attr("id","clip-path-50-100")
        .append('path')
        .datum(scaled_curve_data['millennials'])
        .attr("d", d3.area()
                .curve(d3.curveBasis)
                .x((d,i) => scaled_global_thresholds[i])
                .y1(d=>d)
                .y0(adjusted_height)
        );
    
    svg_plotting_group
        .append('rect')
        .attr("id",'highlight-50-100')
        .attr('class','opacity-transition')
        .attr("fill",'dodgerblue')
        .attr('x',x_scale(50000))
        .attr('y',0)
        .attr('width',x_scale(50000))
        .attr("height",adjusted_height)
        .attr('clip-path',"url(#clip-path-50-100)");
}

function addCommasToK(input_num){
    return `$${input_num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}k`;
}


// -- -- -- -- -- -- -- -- -- -- -- 
// HTML section 25 - loading videos for mouse screens on final HTML section
// Note that this is called on setup
// -- -- -- -- -- -- -- -- -- -- -- 
function loadFinalVideos(){
    if (!(window.matchMedia("(any-pointer:coarse)").matches)){
        document.querySelectorAll('.project-video source').forEach(source_i => {source_i.setAttribute('src', source_i.getAttribute('data-src'))});
        document.querySelectorAll('.project-video').forEach(vid => {vid.load()});
        document.querySelectorAll(".video-div").forEach(function(div_wrapper){
            const curr_video_div = document.getElementById(`video-${div_wrapper.id.slice(-1)}`);
            div_wrapper.addEventListener('mouseover',()=>{curr_video_div.play()});
            div_wrapper.addEventListener('mouseleave',()=>{
                curr_video_div.currentTime = 0;
                curr_video_div.pause();
            });
        });
    };
}
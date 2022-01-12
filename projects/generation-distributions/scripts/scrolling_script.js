// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- VARIABLE DECLARATIONS -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

let scroll_duration = 32000;
const has_mouse = !(matchMedia('(hover: none)').matches);
let auto_scrolling = false;
let bottom_svg_hover = false;
let current_selection = 0;
let ages_line_height = 8; // the width of the svg on top of the density_svg for plotting the current age info
let max_year,curr_age_line,density_enter_rect,density_outer_group,lines_svg_dict,density_svg_dict,grid_svg,wrapper_with_adjusted_margins,wrapper_svg,wrapper_wrapper,scaled_global_max,min_age, max_age, num_ages, plotted_ages, copy_timeout,update_timeout,is_changing,toggle_timeout,resize_timeout,is_expanded, animation_timeout, ages_distance, wheel_timeout, touchscreen_timeout,curveFunction,clipFunction,hover_rect,ages_svg_wrapper,num_x_ticks,global_x_max,global_y_max,x_scale,y_scale,global_thresholds,scaled_global_thresholds,global_num_thresholds,global_age_num,global_age_floor, x_coordinate,scaled_bottom,scaled_top,ages_svg,ages_x_scale,ages_y_scale,line_function;
let animations_dict = [undefined,undefined]
let second_group_disabled = true;
let shown_distributions = [true,false];
let is_transitioning = false;
let tooltips_margin = 5;
let fullscreen = false;
let has_entered_mouse = false;
let is_hovering_ages = false;
let show_group_icon = false;
let icon_group_currently_shown = false;
let has_toolbar = false;
let content_obj = document.documentElement;
let is_small = undefined;
let stop_toolbar_animation = false;
let has_legend = d3.select('#legend').style('display')=='flex';
const fullscreen_index = getFullScreenIndices();
const density_tooltip = d3.select('#density-tooltip');
const document_body = d3.select('body');
const toolbar_selector = d3.select('#toolbar');
const plus_wrapper = d3.select('#plus-wrapper');
const icon_wrapper = d3.select('#icon-wrapper');
const border_hider = d3.select('#border-hider');
let just_resized = false;
let loading_timeout_started = false;
let toggle_forward_back = false;
const num_vertical_lines = 50;
const checkbox = document.querySelector('input[type="checkbox"]');
let work_type = 'full_time';
let animations_selections = ['all_generations', 'boomers']
let most_recently_loaded_files = ['./processed_data/full_time/all_generations/data.json',undefined];
let loaded_distributions = [undefined,undefined];
let plotted_distributions = ['./processed_data/full_time/all_generations/data.json',undefined];

const generations_id_dict = {
    '0': 'all_generations',
    "1": 'greatest',
    '2' : 'silent',
    '3' : 'boomers',
    '4' : 'gen_x',
    '5' : 'millennials'}

const workers_id_dict = {     
    '0': 'full_time',
    "1": 'in_labor_force',
    '2' : 'fred'
}

const uncut_tholds = [ 0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000, 36000, 38000, 40000, 42000, 44000, 46000, 48000, 50000, 52000, 54000, 56000, 58000, 60000, 62000, 64000, 66000, 68000, 70000, 72000, 74000, 76000, 78000, 80000, 82000, 84000, 86000, 88000, 90000, 92000, 94000, 96000, 98000, 100000, 102000, 104000, 106000, 108000, 110000, 112000, 114000, 116000, 118000, 120000, 122000, 124000, 126000, 128000, 130000, 132000, 134000, 136000, 138000, 140000, 142000, 144000, 146000, 148000, 150000, 152000, 154000, 156000, 158000, 160000, 162000, 164000, 166000, 168000, 170000, 172000, 174000, 176000, 178000, 180000, 182000, 184000, 186000, 188000, 190000, 192000, 194000, 196000, 198000, 200000, 202000, 204000, 206000, 208000, 210000, 212000, 214000, 216000, 218000, 220000, 222000, 224000, 226000, 228000, 230000, 232000, 234000, 236000, 238000, 240000, 242000, 244000, 246000, 248000, 250000, 252000, 254000, 256000, 258000, 260000, 262000, 264000, 266000, 268000, 270000, 272000, 274000, 276000, 278000, 280000, 282000, 284000, 286000, 288000, 290000, 292000, 294000, 296000, 298000, 300000, 302000, 304000, 306000, 308000, 310000, 312000, 314000, 316000, 318000, 320000, 322000, 324000, 326000, 328000, 330000, 332000, 334000, 336000, 338000, 340000, 342000, 344000, 346000, 348000, 350000, 352000, 354000, 356000, 358000, 360000, 362000, 364000, 366000, 368000, 370000, 372000, 374000, 376000, 378000, 380000, 382000, 384000, 386000, 388000, 390000, 392000, 394000, 396000, 398000, 400000, 402000];
const generations_scale = d3.scaleOrdinal().domain(['all_generations', 'greatest','silent','boomers','gen_x','millennials']).range(['All generations', 'Greatest','Silent','Boomers','Gen X','Millennials']);
const ticks_scale = d3.scaleThreshold().domain([300,700,1350]).range([2,3,5,8])

function addSvgsAndDivs(){
    // SVG SELECTORS -- -- -- -- -- -- -- -- 
    wrapper_wrapper = d3.select("#density-div")
        .append("svg")
        .attr("width",totalWidth)
        .attr("height",totalHeight+ages_line_height);

    wrapper_wrapper.append("defs")
        .append("marker")
        .attr("id","arrow")
        .attr("viewBox","0 -5 10 10")
        .attr("refX",5)
        .attr("refY",0)
        .attr("markerWidth",3)
        .attr("markerHeight",4)
        .attr("orient",'auto')
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class","arrowHead")
        .style('fill','#545454');

    wrapper_svg = wrapper_wrapper
        .append('g')
        .attr('id','wrapper-svg')
        .attr("width",totalWidth)
        .attr("height",totalHeight)
        .attr("transform","translate(0,"+ages_line_height+")");

    wrapper_svg
        .append("rect")
        .attr('id','rect-svg')
        .attr("width",totalWidth)
        .attr("height",totalHeight-margins.top)
        .attr('fill','white')
        .attr("transform", `translate(0,${margins.top})`)

    wrapper_svg
        .append("rect")
        .attr('id','rect-svg2')
        .attr("width",totalWidth-(margins.left))
        .attr("height",totalHeight-margins.bottom)
        .attr('fill','white')
        .attr("transform","translate("+margins.left+",0)");
    
    wrapper_with_adjusted_margins = wrapper_svg
        .append("g")
        .attr("transform","translate(" + margins.left + "," + margins.top + ")");

    grid_svg = wrapper_with_adjusted_margins.append('g');
    density_svg_dict = [ wrapper_with_adjusted_margins.append("g"),wrapper_with_adjusted_margins.append("g") ];
    lines_svg_dict = [ wrapper_with_adjusted_margins.append("g"), wrapper_with_adjusted_margins.append("g") ];
    density_outer_group = wrapper_with_adjusted_margins.append("g").attr('class','hidden');
    wrapper_with_adjusted_margins.append("g").attr('id','hover-group');

    const density_enter_g = wrapper_wrapper.append('g');
    density_enter_rect = density_enter_g
        .append("rect")
        .attr("id",'density-enter-rect')
        .attr('y',ages_line_height)
        .attr("width",totalWidth)
        .attr('height',totalHeight);

    curr_age_line = density_enter_g
        .append("line")
        .attr('y1',ages_line_height)
        .attr('y2',ages_line_height)
        .attr('x2',margins.left-4.5)
        .attr('x1',totalWidth-margins.right)
        .attr('class','current-age-line hidden');

    d3.select('#density-enter-inner')
        .style("width",`${totalWidth-(margins.left + margins.right)}px`)
        .style("height",`${totalHeight-margins.bottom}px`)
        .style("transform",`translate(${margins.left}px,0)`);
}

// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// DEFINE CLASS FOR EACH DISTRBITUION -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

function updateIncomeAnimationDict(plotting_num,data,filepath){
    animations_dict[plotting_num] = generateIncomeAnimation(plotting_num,data,filepath);
    loaded_distributions[plotting_num] = filepath;
}

function generateIncomeAnimation(plotting_num,data,filepath){
    if (filepath == undefined) return undefined;
    return new IncomeAnimation(plotting_num,data)
}

class IncomeAnimation {
    constructor(plotting_num,data){
        this.plotting_num = plotting_num;
        this.data_obj = data;
        this.curve = undefined;
        this.clip_path = undefined;
        this.drawing_interpolating_functions = undefined;
        this.incomes_interpolating_functions = undefined;
        this.interpolated_incomes = undefined;
        this.hover_indices = [];
        this.clicked_indices = [];
        this.is_selected = current_selection==plotting_num;
        this.hover_info = [-1,-1];
        this.vertical_lines = undefined;
        this.tooltip_percentile = undefined;
        this.ready_to_draw=false;
        this.min_index = undefined;
        this.max_index = undefined;
    }

    getMinMaxIndices(){
        this.min_index = min_age - this.data_obj.min_age;
        this.max_index = (max_age - min_age) + this.min_index;
    }

    readyAnimation(){
        this.makeInterpolatingDictionaries();
        this.initialPlotsAndLines();
        this.ready_to_draw = true;
    }

    makeInterpolatingDictionaries(){
        this.getMinMaxIndices();
        const drawing_functions = {};
        const incomes_functions = {};
        for (let index_i=0; index_i<plotted_ages.slice(0,-1).length;index_i++){
            drawing_functions[index_i + min_age] = d3.interpolateArray(this.data_obj['densities'][this.min_index+index_i].slice(0,global_num_thresholds).map(d=>y_scale(d)),this.data_obj['densities'][this.min_index+index_i+1].slice(0,global_num_thresholds).map(d=>y_scale(d)));
            incomes_functions[index_i + min_age] = d3.interpolateArray(this.data_obj['incomes'][this.min_index+index_i],this.data_obj['incomes'][this.min_index+index_i+1]);
        }
        drawing_functions[max_age] = d3.interpolateArray(this.data_obj['densities'][this.max_index].slice(0,global_num_thresholds).map(d=>y_scale(d)),this.data_obj['densities'][this.max_index].slice(0,global_num_thresholds).map(d=>y_scale(d)));
        incomes_functions[max_age] =  d3.interpolateArray(this.data_obj['incomes'][this.max_index],this.data_obj['incomes'][this.max_index]);
        this.drawing_interpolating_functions = drawing_functions;
        this.incomes_interpolating_functions = incomes_functions;
    }

    interpolate(){
        const residual = global_age_num - global_age_floor;
        return [this.drawing_interpolating_functions[global_age_floor](residual),this.incomes_interpolating_functions[global_age_floor](residual)];
    }

    initialPlotsAndLines(){
        const [scaled_drawing_data,income_data] = this.interpolate();
        this.interpolated_incomes = income_data;
        const this_obj = this;

        this.curve = density_svg_dict[this.plotting_num]
            .append("path")
            .attr("class", `curve-${this.plotting_num} highlight-class-${this.plotting_num} not-axes density-group-${this.plotting_num} hidden`)
            .datum(scaled_drawing_data)
            .attr("d", (d,i) => curveFunction(d,i));

        this.clip_path = density_svg_dict[this.plotting_num].append('clipPath')
            .attr('id',`clip-path-${this.plotting_num}`)
            .attr('class',`not-axes density-group-${this.plotting_num}`)
            .append("path")
            .datum(scaled_drawing_data)
            .attr("d", (d,i) => clipFunction(d,i));

        this.vertical_lines = lines_svg_dict[this.plotting_num].selectAll(`.vertical-line-${this.plotting_num}`)
            .data(this.interpolated_incomes)
            .enter()
            .append('line')
            .attr('class',(d,i) => `hidden not-axes density-group-${this_obj.plotting_num} vertical-line vertical-line-${this_obj.plotting_num} vertical-line-${this_obj.plotting_num}-${i}` + (i==num_vertical_lines-1 ? ` average-line` : ''))            .attr('y1',scaled_bottom)
            .attr('y2',scaled_top)
            .attr('x1',d=>x_scale(d))
            .attr('x2',d=>x_scale(d))
            .each((d,i) => {if (this_obj.clicked_indices.includes(i)) this_obj.addClickedPercentile(i)});

    }

    redraw(){
        if (this.ready_to_draw){
            const [scaled_drawing_data,interpolated_incomes] = this.interpolate();
            this.interpolated_incomes = interpolated_incomes;
            this.curve.datum(scaled_drawing_data).attr("d", (d,i) => curveFunction(d,i));
            this.clip_path.datum(scaled_drawing_data).attr("d", (d,i) => clipFunction(d,i));
            this.vertical_lines.data(interpolated_incomes).attr('x1',d=>x_scale(d)).attr('x2',d=>x_scale(d));
            if (this.is_selected && bottom_svg_hover) {
                this.highlightClosest()
            } else if (is_hovering_ages && this.tooltip_percentile != undefined){
                this.showTooltip(this.tooltip_percentile,false)
            };
        }
    }

    showTooltip(percentile_index,include_income_amount){
        const percentile_string = ((percentile_index+1)*2 ).toFixed(0);
        density_tooltip
            .html(`<p>${percentile_index != num_vertical_lines - 1 ? (`${percentile_string}${(percentile_string.slice(-1) == '2' ? 'nd' : 'th')} percentile` ) : 'Average'}</p>`+ (include_income_amount ? `<p>$${this.interpolated_incomes[percentile_index].toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>` : ''))
            .style('left',`${this.interpolated_incomes[percentile_index]<=(global_x_max/2) ? x_scale(this.interpolated_incomes[percentile_index])+margins.left + tooltips_margin : x_scale(this.interpolated_incomes[percentile_index])+margins.left - (+density_tooltip.style('width').slice(0,-2)) - tooltips_margin}px`)
            .style("opacity","1");
    }

    addHoveredPercentile(percentile_index){
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-hovered-${this.plotting_num}`,true);
        if (this.clicked_indices.includes(percentile_index)) this.toggleYearLineHover(percentile_index,true);
    }

    toggleYearLineHover(percentile_index,adding_hover){
        ages_svg.select(`#ages-line-${this.plotting_num}-${percentile_index}`).classed(`ages-line-hovered-${this.plotting_num}`,adding_hover);
        if (percentile_index==num_vertical_lines-1) ages_svg.select(`#ages-line-${this.plotting_num}-${percentile_index+1}`).classed(`ages-line-hovered-${this.plotting_num}`,adding_hover);
    }

    removeHoveredPercentile(percentile_index){
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-hovered-${this.plotting_num}`,false);
        if (this.clicked_indices.includes(percentile_index)){
            this.toggleYearLineHover(percentile_index,false);
            if (percentile_index==num_vertical_lines-1) this.toggleYearLineHover(percentile_index+1,false);
        }
    }

    addClickedPercentile(percentile_index){
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-clicked-${this.plotting_num} highlight-class-${this.plotting_num}`,true).classed('line-not-clicked',false);
        ages_svg.select(`#ages-line-${this.plotting_num}-${percentile_index}`).classed(`ages-line-clicked ages-line-clicked-${this.plotting_num}`,true);
        if (percentile_index==num_vertical_lines-1) ages_svg.select(`#ages-line-${this.plotting_num}-${percentile_index+1}`).classed(`ages-line-clicked ages-line-clicked-${this.plotting_num}`,true);
    }


     // Need this separate from addClickedPercentile as addClickedPercentile may be called on startup
     addHoverOnClick(percentile_index){
        this.clicked_indices.push(percentile_index);
        this.toggleYearLineHover(percentile_index,true);
    }

    removeClickedPercentile(percentile_index){
        const curr_index = this.clicked_indices.indexOf(percentile_index);
        this.clicked_indices.splice(curr_index,1)
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-clicked-${this.plotting_num} highlight-class-${this.plotting_num}`,false).classed('line-not-clicked',true);
        ages_svg.select(`#ages-line-${this.plotting_num}-${percentile_index}`).classed(`ages-line-hovered-${this.plotting_num} ages-line-clicked ages-line-clicked-${this.plotting_num}`, false);
        if (percentile_index==num_vertical_lines-1) ages_svg.select(`#ages-line-${this.plotting_num}-${percentile_index+1}`).classed(`ages-line-hovered-${this.plotting_num} ages-line-clicked ages-line-clicked-${this.plotting_num}`, false);
    }

    removeAllHoveredPercentiles(){
        for (let i = this.hover_indices.length-1;i>=0;i--) this.removeHoveredPercentile(this.hover_indices[i]);
        this.hover_indices = [];
        this.hover_info=[-1,-1];
        if (!is_hovering_ages) {
            density_tooltip.style('opacity','0');
            this.tooltip_percentile = undefined;
        }
    }

    // Adding
    clickFunction(){
        for (let i=0;i<this.hover_indices.length;i++){
            let curr_percentile_index = this.hover_indices[i];
            if (this.clicked_indices.includes(curr_percentile_index)){
                this.removeClickedPercentile(curr_percentile_index);
            } else{
                this.addClickedPercentile(curr_percentile_index);
                this.addHoverOnClick(curr_percentile_index);
            }
        }
    }

    highlightClosest(){
        const closest_value = findClosest(this.interpolated_incomes,x_coordinate);
        const all_values = closest_value == 0 ? getAllZeroValues(this.interpolated_incomes,0) : [this.interpolated_incomes.indexOf(closest_value)];
        const curr_array = [all_values,all_values.length];
        if (curr_array[0] != this.hover_info[0] || curr_array[1] != this.hover_info[1]){
            // Remove hovers
            if (this.hover_info[1]>0){
                for (let i = this.hover_info[1]-1;i>=0;i--) this.removeHoveredPercentile(this.hover_indices[i]);
                this.hover_indices = [];
            }
            this.hover_info = curr_array;
            // Add hovers
            for (let k=0;k<curr_array[1];k++) this.addHoveredPercentile(all_values[k]);
            this.hover_indices = all_values;
        }
        this.showTooltip(d3.max(all_values),true);
    }

    redrawClickedYearsLines(){
        for (let i=0;i<=this.clicked_indices.length;i++) this.addClickedPercentile(this.clicked_indices[i]);
    }
}


// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- SETUP -- -- -- -- -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

if (isIE()){
    d3.selectAll('.hidden').remove();
    d3.select('#loader-content').remove();
    d3.select('#background-ages').remove();
    d3.select('#background-rect').remove();
    d3.select('#density-div').remove();
    d3.select('#ie-issues').style('display','flex');
} else{
    // example ?id0=2222?id1=123?s=500?p0=50?p1=50
    const real_url = new URL(window.location.href);
    let search_params;
    let percentile_vec0 = [];
    let percentile_vec1 = [];
    let scroll_amount = 0;
    let remove_density_enter = false;
    if (real_url.searchParams.has('id0')){
        search_params = real_url.searchParams;
    } else{
        const dummy_url = new URL(`https://www.electricscatter.com/${sessionStorage.getItem('generations_saving_str')}`);
        search_params = dummy_url.searchParams;
    }
    if (search_params.has('id0')){
        stop_toolbar_animation = true;
        remove_density_enter = true;
        if (search_params.has('s')) scroll_amount =  (+search_params.get('s')/1000);
        const id0 = search_params.get("id0");
        work_type =  workers_id_dict[id0[0]];
        if (search_params.has('p0')){
            const p0 = search_params.get('p0');
            if (p0.length % 2 === 0) for (let i=0;i<=p0.length-1;i=i+2) percentile_vec0.push(+p0.slice(i,i+2));
        }
        updateGroupOnSetup(id0.slice(1),0);
        if (search_params.has('id1')){
            const id1 = search_params.get("id1");
            updateGroupOnSetup(id1,1);
            if (search_params.has('p1')){
                const p1 = search_params.get('p1');
                if (p1.length % 2 === 0) for (let i=0;i<=p1.length-1;i=i+2) percentile_vec1.push(+p1.slice(i,i+2))
            }
        }
    } else if (sessionStorage.getItem('incomes_saving_str') !==null){
        // Remove density enter if they've used the other app (only works on same tab)
        remove_density_enter = true;
    }
    initialSetup(most_recently_loaded_files[0],most_recently_loaded_files[1],scroll_amount,percentile_vec0,percentile_vec1,remove_density_enter);
}

// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- FUNCTIONS -- -- -- -- -
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 
// -- -- -- -- -- -- -- -- -- -- -- -- -- 

function getAllHeightsAndMargins(){
    [totalWidth,totalHeight] = getWidthAndHeight();
    margins = getMargins(); 
    [modifiedWidth,modifiedHeight] = widthAndHeightMinusMargins(margins,totalWidth,totalHeight);
}


function updateGroupOnSetup(input_str,group_index){
    animations_selections[group_index] = generations_id_dict[input_str[0]];
    const filename =  selectionsToAccessingString(group_index);
    most_recently_loaded_files[group_index] = filename;
    plotted_distributions[group_index] = filename;
}

function setHeight(is_resizing = false,toolbar_changing=false){
    const curr_is_small = window.matchMedia('(max-width: 1050px), (max-height:635px)').matches;
    if (is_small!=curr_is_small){
        if (is_resizing){
            if (is_small){
                if (toolbar_changing)  interruptToolbarToggle();
                d3.select('#toolbar').style('left','calc(100% - 323px)');
                d3.select('#icon-wrapper').style('left','calc(100% - 323px)');
                is_expanded = false;
            } else {
                is_expanded = true;
                toggleToolbar(0);
            }
        }
        is_small = curr_is_small;
        ages_distance = is_small ? 48 : 62;
        setBackgroundHeight();
    } else{
        if (toolbar_changing && is_small){
            interruptToolbarToggle();
            is_expanded = !is_expanded;
            toggleToolbar(0);
        }
    }
    if (!is_resizing) is_expanded = is_small;
}


function getGroupString(input_index){
    return getKeyByValue(generations_id_dict, animations_selections[input_index]);
}

function indexToTwoDigits(input_index){
    if (input_index < 10) return `0${input_index.toString()}`;
    return input_index.toString();
}

function copyToClipboard(string) {
    let textarea;
    let result;
    try {
      textarea = document.createElement('textarea');
      textarea.setAttribute('readonly', true);
      textarea.setAttribute('contenteditable', true);
      textarea.style.position = 'fixed'; // prevent scroll from jumping to the bottom when focus is set.
      textarea.value = string;
  
      document.body.appendChild(textarea);
  
      textarea.focus();
      textarea.select();
  
      const range = document.createRange();
      range.selectNodeContents(textarea);
  
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
  
      textarea.setSelectionRange(0, textarea.value.length);
      result = document.execCommand('copy');
      document.getElementById('copy-text').innerHTML ='Link copied';
      copy_timeout = setTimeout(function(){
          document.getElementById('copy-text').innerHTML = 'Copy link to current graph';
          copy_timeout = undefined;
      },1000);
    } catch (err) {
      result = null;
    } finally {
      document.body.removeChild(textarea);
    }
    // manual copy fallback using prompt
    if (!result) {
        d3.select("#copy-button").style('transform','none');
        result = prompt('Highlight and copy', string); // eslint-disable-line no-alert
    }
  }

function generateStateLink(){
    if (copy_timeout){
        clearTimeout(copy_timeout)
        copy_timeout = undefined;
    }
    const saving_str = generateSavingStr();
    copyToClipboard(`https://electricscatter.com/g${saving_str}`);
}

function generateSavingStr(){
    const id0 =  getKeyByValue(workers_id_dict, work_type) + getGroupString(0);
    const s = Math.round(1000 * content_obj.scrollTop / scroll_limit);
    let p0 = '';
    for (clicked_ind0 of animations_dict[0].clicked_indices) p0 += indexToTwoDigits(clicked_ind0);
    let saving_str = `?id0=${id0}` + ((s==0) ? '' : `&s=${s}`) + ((p0=='') ? '' : `&p0=${p0}`)
    if (animations_dict[1]){
       let p1 = '';
       for (clicked_ind1 of animations_dict[1].clicked_indices) p1 += indexToTwoDigits(clicked_ind1);
       saving_str += `&id1=${ getGroupString(1)}`  + ((p1=='') ? '' : `&p1=${p1}`);
    }
    return (saving_str);
}

function storeSavingStr(){
    const saving_string = generateSavingStr();
    sessionStorage.setItem("generations_saving_str",saving_string);
    sessionStorage.setItem("generations_scroll_speed",document.getElementById("myRange").value);
    sessionStorage.setItem('generations_highlight_selection',current_selection);
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

function toolbarChanges(){
        if (has_toolbar != (d3.select('#percent').style('height') != d3.select('#vh').style('height'))){
            has_toolbar = !has_toolbar;
            content_obj = has_toolbar ? document.getElementById('content') : document.documentElement;
            if (has_toolbar){
                d3.select(window).on("scroll.scroller", null);
                d3.select('#content').on("scroll.scroller", globalInterpolate);
                d3.select('body').style('overflow','hidden');
                d3.select('#content').style('position','fixed').style('overflow-y','scroll');
                if (has_mouse){
                    d3.select("#density-div").on('wheel',function(){
                        d3.select("#density-div").style('pointer-events','none');
                        if (wheel_timeout){
                            wheel_timeout = undefined;
                            clearTimeout(wheel_timeout)
                        };
                        wheel_timeout = setTimeout(function(){
                            d3.select("#density-div").style('pointer-events','initial');
                            wheel_timeout = undefined;
                        },250)});
                }
            } else{
                d3.select('#content').on("scroll.scroller", null);
                d3.select('body').style('overflow','initial');
                d3.select('#content').style('position','initial').style('overflow-y','initial');
                d3.select(window).on("scroll.scroller", globalInterpolate);
                if (has_mouse) d3.select("#density-div").on('wheel',null)
            }
        }
}

function tickFunction(d){
    if (d==0) return "$0";
    const rounded_num = Math.round(d / 1000);
    const curr_str = rounded_num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$${curr_str}k`
}

async function loadDataAssignToDistribution(updating_index){
    const new_filepath = makeNewAccessingString(updating_index);
    // Should only call this function if it isn't the most recently selected
    // i.e., if there's no state change you shouldn't do anything
    if (most_recently_loaded_files[updating_index] != new_filepath){
        most_recently_loaded_files[updating_index] = new_filepath;
        plotted_distributions[updating_index] = -1;
        loaded_distributions[updating_index] = -1;
        makeUpperStrings();
        if (animations_dict[updating_index]){
            animations_dict[updating_index].ready_to_draw = false;
            animations_dict[updating_index].clicked_indices = [];
        }
        const new_data = new_filepath == undefined ? undefined : await d3.json(new_filepath);
        // Should only call this function if the updates haven't changed
        // If the distribution for the filepath is already loaded, don't recreate it
        if (new_filepath == makeNewAccessingString(updating_index) && loaded_distributions[updating_index] != new_filepath){
            updateIncomeAnimationDict(updating_index,new_data,new_filepath);
            shown_distributions[updating_index] = false;
        }
    }
}

async function updateDistributions(){
    d3.select('#hover-rect').style('cursor','initial');
    if (!loading_timeout_started && has_entered_mouse){
        loading_timeout_started = true;
        loader_timeout = setTimeout(function(){
            d3.select("#density-enter").style('display','flex');
            d3.select("#density-loader").style('display','block');
            loader_timeout = undefined;
        },100);
    }
    is_transitioning=true;
    if (animation_timeout){
        clearTimeout(animation_timeout);
        animation_timeout = undefined;
    }
    await loadDataAssignToDistribution(0);
    await loadDataAssignToDistribution(1);
    const f0 = makeNewAccessingString(0);
    const f1 = makeNewAccessingString(1);
    // Only want to call this function once for a given combo
    if (f0 == loaded_distributions[0] && f1 == loaded_distributions[1]){
        if (f0 != plotted_distributions[0] || f1 != plotted_distributions[1]){
            plotted_distributions = [f0,f1];
            if (has_entered_mouse){
                loading_timeout_started = false;
                if (loader_timeout){
                    clearTimeout(loader_timeout);
                    loader_timeout = undefined;
                }
                d3.select("#density-enter").style('display','none');
                d3.select("#density-loader").style('display','none');
            }
            const [old_x_max,old_y_max] = [global_x_max,global_y_max];
            const old_x_scale = x_scale;
            const old_num_ages = num_ages;
            [min_age,max_age] = getAgeBounding();
            num_ages = getNumAges();
            if (old_num_ages != num_ages){
                plotted_ages = makeAgeVec(min_age,max_age);
                setBackgroundHeight();
                updateHorizontalYearLinesAndText();
                initializeScrollNums();
            }
            setGlobalMaxes();
            let changing_axes = true;
            (old_x_max != global_x_max || old_y_max != global_y_max) ? makeScales() : changing_axes = false;
            if (old_y_max!=global_y_max) makeConstantScales();
            if (old_x_max!=global_x_max) scaled_global_thresholds = global_thresholds.map(d=>x_scale(d));
            if (shown_distributions[0]) animations_dict[0].makeInterpolatingDictionaries();
            if (shown_distributions[1]) animations_dict[1].makeInterpolatingDictionaries();
            changing_axes ? animateTransition(old_x_scale) : finishTransition();
        }
    }
}

// If shown_distribution 0 or 1 -> Update ages and lines and text -> Scroll to new location. Then Update ages lines and text
// If no shown distribution 0 or 1. Update ages lines and text to 18-65. Scroll to new location. Cut ages lines and text.

function animateTransition(previous_x_scale){
    updateAxes();
    updateDensityGridLines(previous_x_scale);
    if (shown_distributions[0]) updateDensityPlotClipPathVerticalLines(0);
    if (shown_distributions[1]) updateDensityPlotClipPathVerticalLines(1);
    animation_timeout = setTimeout(function(){
        finishTransition();
        animation_timeout = undefined;
    },525);
}


function updateDensityPlotClipPathVerticalLines(animating_index){
    const [scaled_drawing_data,income_data] = animations_dict[animating_index].interpolate();
    density_svg_dict[animating_index].selectAll(`.curve-${animating_index}`)
        .datum(scaled_drawing_data)
        .transition()
        .duration(500)
        .attr("d", (d,i) => curveFunction(d,i))
    animations_dict[animating_index].clip_path
        .datum(scaled_drawing_data)
        .transition()
        .duration(500)
        .attr("d", (d,i) => clipFunction(d,i))
    lines_svg_dict[animating_index].selectAll(`.vertical-line-${animating_index}`)
        .data(income_data)
        .transition()
        .duration(500)
        .attr('x1',d=>x_scale(d))
        .attr('x2',d=>x_scale(d));
}

function updateDensityGridLines(old_x_scale){
    const grid_selection = grid_svg.selectAll(".grid-line").data(x_scale.ticks(num_x_ticks).slice(1),d=>d);
    grid_selection.enter()
        .append('line')
        .attr("class","grid-line")
        .attr("y1", scaled_top)
        .attr("y2", scaled_bottom)
        .attr("x1", d => old_x_scale(d))
        .attr("x2", d => old_x_scale(d))
        .style('opacity',0)
        .merge(grid_selection)
        .transition()
        .duration(500)
        .attr("x1", d => x_scale(d))
        .attr("x2", d => x_scale(d))
        .style('opacity',0.1);
    grid_selection.exit()
        .transition()
        .duration(500)
        .style('opacity',0)
        .attr("x1", d => x_scale(d))
        .attr("x2", d => x_scale(d))
        .remove();
}

function drawGroup(group_index){
    animations_dict[group_index].readyAnimation();
    drawLinesAndDots(animations_dict[group_index].data_obj.transposed_incomes,group_index);
}

function finishTransition(){
    cutAndScaleThresholds();
    updateYearsGridLines(x_scale.ticks(num_x_ticks).slice(1));
    finishGroup(0);
    if (animations_dict[1]!=undefined) finishGroup(1);
    d3.select('#hover-rect').style('cursor','pointer');
    wrapper_with_adjusted_margins.selectAll('.hidden').classed('hidden',false);
    agesLinesEventListeners();
    is_transitioning=false;
}

function finishGroup(group_index){
    removeGroup(group_index)
    updateYearsLines(group_index);
    drawGroup(group_index);
    animations_dict[group_index].redrawClickedYearsLines();
    shown_distributions[group_index] = true;
}

function setGlobalMaxes(){
    if (animations_dict[1]) {
        let curr_x_max = -1;
        let curr_y_max = -1;
        for (let i=min_age;i<=max_age;i++){
            const inner_x_max = Math.max(animations_dict[0].data_obj.x_maxes[String(i)],animations_dict[1].data_obj.x_maxes[String(i)]);
            const inner_y_max = Math.max(animations_dict[0].data_obj.y_maxes[String(i)],animations_dict[1].data_obj.y_maxes[String(i)]);
            if (inner_x_max > curr_x_max) curr_x_max = inner_x_max;
            if (inner_y_max > curr_y_max) curr_y_max = inner_y_max;
        }
        curr_x_max += 20000;
        [global_x_max,global_y_max] = [curr_x_max - (curr_x_max % 2000), curr_y_max];
    } else{
        const curr_x_max = animations_dict[0].data_obj.global_x_max+20000;
        [global_x_max,global_y_max] =  [curr_x_max - (curr_x_max % 2000),animations_dict[0].data_obj.global_y_max];
    }
}

function removeGroup(group_index){
    wrapper_with_adjusted_margins.selectAll(`.density-group-${group_index}`).remove();
    ages_svg.selectAll(`.ages-line-${group_index}`).remove();
}

function getAgeBounding(){
    let min_age = animations_dict[0].data_obj.min_age;
    let max_age = animations_dict[0].data_obj.max_age;
    if (animations_dict[1]){
        min_age = Math.max(min_age,animations_dict[1].data_obj.min_age);
        max_age = Math.min(max_age,animations_dict[1].data_obj.max_age);
    }
    return [min_age,max_age]
}

function makeAgeVec(min_age,max_age){
    let age_vec = [];
    for (let i=min_age;i<max_age+1;i++) age_vec.push(i)
    return age_vec;
}

function getNumAges(){
    return (max_age - min_age)+1;
}

function setBackgroundHeight(){
    ages_lower = ages_distance * (num_ages-1);
    scroll_limit = ages_lower;
    d3.select('#background-rect').style('height',`${ages_distance*(num_ages-1)}px`);
    d3.select('#background-ages').style('height',`${ages_distance*(num_ages)}px`);
}

function drawLinesAndDots(transposed_incomes,plotting_index){    
    const min_index = animations_dict[plotting_index].min_index;
    const max_index = animations_dict[plotting_index].max_index+1;
    ages_svg
        .selectAll(`.age-plots-${plotting_index}`)
        .data(transposed_incomes)
        .enter()
        .append('path')
        .attr("d", d => line_function(d.slice(min_index,max_index)))
        .attr('class',(d,i) => `age-info ages-line ages-line-${plotting_index}` + (i==num_vertical_lines-1 ? ` background-line` : ''))
        .attr('id',(d,i)=> `ages-line-${plotting_index}-${i}`);

    ages_svg
        .append('path')
        .attr("d", line_function(transposed_incomes[num_vertical_lines-1].slice(min_index,max_index)))
        .attr('class', `age-info ages-line ages-line-${plotting_index} average-line`)
        .attr('id',d=> `ages-line-${plotting_index}-${num_vertical_lines}`);
}

function makeYearsSvg(){
    ages_svg_wrapper = d3.select("#background-ages")
            .append("svg")
            .attr('id','ages-svg')
            .attr("width",'100%')
            .attr("height",'100%');
    ages_svg = ages_svg_wrapper
            .append("g")
            .attr("transform", "translate(" + margins.left + ",0)");
}

function makeYearsGridLines(){
    const ages_lower_padding = (ages_distance*(num_ages-1)) + ages_line_height;
    ages_svg.selectAll(".ages-grid-line")
        .data(x_scale.ticks(num_x_ticks).slice(1))
        .enter()
        .append("line")
        .attr("class","age-info ages-grid-line hidden")
        .attr("x1",d=> ages_x_scale(d))
        .attr("x2",d=> ages_x_scale(d))
        .attr("y1", ages_line_height)
        .attr("y2", ages_lower_padding);
}

function makeYearsInfo(){
    makeYearsGridLines();
    drawLinesAndDots(animations_dict[0].data_obj.transposed_incomes,0);
    if (animations_dict[1]!=undefined) drawLinesAndDots(animations_dict[1].data_obj.transposed_incomes,1);
}

function horizontalYearLinesAndText(make_hidden=true){
    const zero_scaled = x_scale(0);
    const hidden_str = make_hidden ? 'hidden' : '';
    const ages_line_selector =  ages_svg.selectAll('.age-line').data(plotted_ages,(d,i)=>i);
    ages_line_selector
        .enter()
        .append('line')
        .merge(ages_line_selector)
        .attr('y1',(d,i)=>ages_y_scale(i))
        .attr('y2',(d,i)=>ages_y_scale(i))
        .attr('x1',zero_scaled)
        .attr('x2',scaled_global_max)
        .attr('class',`${hidden_str} age-line age-info`);
    ages_line_selector.exit().remove();

    const ages_svg_wrapper_selector =  ages_svg_wrapper.selectAll('.age-text').data(plotted_ages,(d,i)=>i);
    ages_svg_wrapper_selector
        .enter()
        .append('text')
        .merge(ages_svg_wrapper_selector)
        .attr('y',(d,i)=>ages_y_scale(i))
        .attr('x',margins.left-12)
        .attr('id',(d,i)=>`age-text-${i}`)
        .attr('class',`${hidden_str} age-text age-info`)
        .attr('dominant-baseline',`central`)
        .text(d => String(d));
        
    ages_svg_wrapper_selector.exit().remove();
}

function updateHorizontalYearLinesAndText(){
    updateScrollSpeed(document.getElementById("myRange").value*(-1));      
    horizontalYearLinesAndText(false); 
    makeYearsTooltips();
}

function makeYearsTooltips(){
    const base_height = (+d3.select('#title-div').style('height').slice(0,-2)) + 45;
    const ages_tooltip_selector = d3.select("#background-ages").selectAll('.ages-tooltip').data(new Array(num_ages).fill(-1));
        
    ages_tooltip_selector
        .enter()
        .append('div')
        .merge(ages_tooltip_selector)
        .html('$100,000')
        .attr('class',`ages-tooltip hidden`)
        .style('top',(d,i)=>`${ages_y_scale(i)+base_height}px`);
    ages_tooltip_selector.exit().remove();
    
    adjustYearsTooltips();
}

function addYearTooltips(input_index,selection_index){
    toggleLegendOpacity('0');
    const left_right = animations_dict[selection_index].interpolated_incomes[input_index] <= animations_dict[selection_index].interpolated_incomes[36];
    const min_index = animations_dict[selection_index].min_index;
    const max_index = animations_dict[selection_index].max_index + 1;
    d3.select("#background-ages").selectAll('.ages-tooltip')
        .data(animations_dict[selection_index].data_obj.transposed_incomes[input_index].slice(min_index,max_index))
        .html(d=>`$${d.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`)
        .style('left',function(d){ return left_right ? `${ages_x_scale(d)+margins.left + tooltips_margin}px` : `${ages_x_scale(d)+margins.left - this.clientWidth - tooltips_margin}px`})
        .style('opacity','1');
    animations_dict[selection_index].showTooltip(+input_index,false);
    animations_dict[selection_index].tooltip_percentile = +input_index;
}

function removeYearTooltips(){
    d3.select("#background-ages").selectAll('.ages-tooltip').style('opacity','0')
}

function widthAndHeightMinusMargins(margin_var,total_width,total_height){
    const modified_width = (total_width-margin_var.right) - margin_var.left;
    const modified_height = (total_height - margin_var.top) - margin_var.bottom;
    return [modified_width,modified_height]
}

function getWidthAndHeight(){
    const boundingBox = document.getElementById('density-div').getBoundingClientRect();
    return [boundingBox.width,boundingBox.height-ages_line_height];
}

function scroll(){
    if (auto_scrolling===false){
        const percentage_scrolled = content_obj.scrollTop/scroll_limit;
        if (percentage_scrolled<1){
            document.getElementById("play-button").style.opacity = 0;
            document.getElementById("pause-button").style.opacity = 1;
            auto_scrolling=true;
            document_body.transition()
                .duration((1 - percentage_scrolled)*scroll_duration)
                .ease(d3.easeLinear)
                .tween("scroll", scrollTween(scroll_limit))
                .on("end", function(){
                    document.getElementById("play-button").style.opacity = 1;
                    document.getElementById("pause-button").style.opacity = 0;
                    auto_scrolling=false;
                });
            }
        }
}

function scrollTween(offset) {
    return function() {
    let i = d3.interpolateNumber(content_obj.scrollTop, offset);
      return function(t) { content_obj.scrollTo(0, i(t)); };
    };
}

function stopScrolling(){
    console.log("here")
    document.getElementById("pause-button").style.opacity = 0;
    document.getElementById("play-button").style.opacity = 1;
    document_body.interrupt();
    auto_scrolling = false;
}

function cutAndScaleThresholds(){
    global_thresholds = uncut_tholds.filter(item => item <= global_x_max);
    global_num_thresholds = global_thresholds.length;
    scaled_global_thresholds = global_thresholds.map(d=>x_scale(d));
}

function makeAxes(){
    num_x_ticks = ticks_scale(totalWidth);
    density_outer_group.append("g")
        .attr("transform", "translate(0," + modifiedHeight + ")")
        .attr('class','axes x-axis')
        .call(d3.axisBottom()
            .scale(x_scale)
            .ticks(num_x_ticks)
            .tickSizeOuter(0)
            .tickFormat(d => tickFunction(d)))
    density_outer_group.append('g')
        .classed("axes y-axis hidden", true)
        .call(d3.axisLeft(y_scale)
        .tickSizeOuter(0)
        .tickValues([]))
    grid_svg.selectAll(".grid-line")
        .data(x_scale.ticks(num_x_ticks).slice(1),d=>d)
        .enter()
        .append("line")
        .attr("class","hidden grid-line hidden")
        .attr("x1", function(d){ return x_scale(d)})
        .attr("x2", function(d){ return x_scale(d)})
        .attr("y1", scaled_top)
        .attr("y2", scaled_bottom);
}

function removeAxes(){
    grid_svg.selectAll('.grid-line').remove();
    density_outer_group.selectAll('.axes').remove();
    wrapper_svg.selectAll('.axis-label').remove();

}

function removePlotsandLines(){
    wrapper_svg.selectAll('.not-axes').remove();
}

function removeYearLinesAndTooltips(){
    ages_svg.selectAll('.ages-grid-line').remove();
    ages_svg_wrapper.selectAll('.age-info').remove();
    d3.select('#background-ages').selectAll('.ages-tooltip').remove();
}

function makeScales(){
    x_scale = d3.scaleLinear().domain([0, global_x_max]).range([0, modifiedWidth]);
    y_scale = d3.scaleLinear().domain([0, global_y_max]).range([modifiedHeight,0]);
    ages_x_scale = d3.scaleLinear().domain([0,global_x_max]).range([0,modifiedWidth]);
    ages_y_scale = i => (i*ages_distance) + ages_line_height;
    line_function = d3.line().x(d => ages_x_scale(d)).y((d,i) => ages_y_scale(i));
}

function updateAxes(){
    density_outer_group.select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y_scale)
        .tickSizeOuter(0)
        .tickValues([]));

    density_outer_group.select(".x-axis")
        .transition()
        .duration(500)
        .call(d3.axisBottom()
        .scale(x_scale)
        .tickSizeOuter(0)
        .ticks(num_x_ticks)
        .tickFormat(d => tickFunction(d)));
}


function updateYearsGridLines(grid_data){
    const ages_lower_padding = (ages_distance*(num_ages-1)) + ages_line_height;
    ages_svg.selectAll(".ages-grid-line").remove();
    ages_svg.selectAll(".ages-grid-line").data(grid_data)
        .enter()
        .append('line')
        .attr("class","ages-grid-line")
        .attr("y1", ages_line_height)
        .attr("y2", ages_lower_padding)
        .attr("x1", function(d){ return ages_x_scale(d)})
        .attr("x2", function(d){ return ages_x_scale(d)});
}

function updateYearsLines(updating_index){
    const min_index = animations_dict[updating_index].min_index;
    const max_index = animations_dict[updating_index].max_index + 1;
    ages_svg.selectAll(`.ages-line-${updating_index}`)
        .data(animations_dict[updating_index].data_obj.transposed_incomes)
        .attr("d", function(d){ return line_function(d.slice(min_index,max_index))});
    ages_svg.select(`#ages-line-${updating_index}-${num_vertical_lines}`).attr('d',line_function(animations_dict[updating_index].data_obj.transposed_incomes[num_vertical_lines-1].slice(min_index,max_index)));
}

function drawingFunctions(){
    curveFunction = d3.area().curve(d3.curveBasis).x((d,i) => scaled_global_thresholds[i]).y1(d=>d).y0(scaled_bottom);
    clipFunction = d3.area().curve(d3.curveBasis).x((d,i) => scaled_global_thresholds[i]).y1(d=>d).y0(scaled_top);
}

function globalInterpolate(){
    global_age_num =  (Math.max(Math.min(content_obj.scrollTop / scroll_limit, 1),0)) * (num_ages-1) + min_age;
    global_age_floor = Math.floor(global_age_num); // lower bound 0, upper bound thing
    animations_dict[0].redraw();
    if (animations_dict[1]!=undefined) animations_dict[1].redraw();
}

function addClickedPercentiles(percentile_vec,input_ind){
    for (p_i of percentile_vec){
        animations_dict[input_ind].clicked_indices.push(p_i)
        animations_dict[input_ind].addClickedPercentile(p_i);
    }
}

function initialStyling(){
    checkbox.checked=animations_dict[1]!=undefined;
    for (let group_index of [0,1]){
        document.querySelectorAll(`.button-${group_index}`).forEach(btn => {btn.checked=false});
        document.querySelectorAll(`.selector-${group_index}`).forEach(btn => {btn.selected=false});
        document.getElementById(`select-generation-${group_index}-${animations_selections[group_index]}`).selected = true;
        document.getElementById(`radio-generation-${group_index}-${animations_selections[group_index]}`).checked = true;
    }
}

function setInitialScrollSpeed(){
    const scroll_speed = +sessionStorage.getItem('generations_scroll_speed');
    if (scroll_speed!=0){
        document.getElementById('myRange').value = scroll_speed;
        updateScrollSpeed(scroll_speed*-1);
        return;
    }
    document.getElementById('myRange').value = -32000;
}


function setHighlightSelector(selection_index){
    document.getElementById(`group${selection_index}highlight`).checked=true; 
    document.getElementById(`group${Math.abs(1-selection_index)}highlight`).checked=false; 
}

function setInitialState(){
    if (animations_dict[1]){
        addDistribution(false);
        const current_selection = +sessionStorage.getItem('generations_highlight_selection');
        setHighlightSelector(current_selection);
        if (current_selection===1){
            toggleDistributionSelection();
        } else if (show_group_icon){
            showGroupIcon('crimson',0.8);
        }
    }
    document.querySelectorAll('.highlight-button').forEach(e=>e.disabled=animations_dict[1]==undefined);
    initialStyling();
    setInitialScrollSpeed();
    document.getElementById('workers-selector').value = work_type;
    d3.select('#switch-div').style('display','block');
}

async function initialSetup(fname0,fname1,scroll_amount,percentile_vec0,percentile_vec1,remove_density_enter){
    updateIncomeAnimationDict(0,await d3.json(fname0),fname0);
    if (fname1) updateIncomeAnimationDict(1,await d3.json(fname1),fname1);
    [min_age,max_age] = getAgeBounding();
    plotted_ages = makeAgeVec(min_age,max_age);
    num_ages = getNumAges();
    max_year = animations_dict[0].data_obj.max_year;
    setHeight();
    getAllHeightsAndMargins();
    addSvgsAndDivs();
    toolbarChanges();
    setWindowEventListeners();
    setToolbarListeners();
    initializeScrollNums();
    setGlobalMaxes();
    makeScales();
    cutAndScaleThresholds();
    makeConstantScales();
    drawingFunctions();
    animations_dict[0].readyAnimation();
    if (fname1) animations_dict[1].readyAnimation();
    hoverActions();
    makeAxes();
    addAxisText();
    makeYearsSvg();
    scaled_global_max = scaled_global_thresholds[global_num_thresholds-1];
    horizontalYearLinesAndText();
    makeYearsInfo();
    makeYearsTooltips();
    agesLinesEventListeners();
    makeUpperStrings();
    addClickedPercentiles(percentile_vec0,0)
    if (fname1)  addClickedPercentiles(percentile_vec1,1)
    d3.select(has_toolbar ? '#content' : window).on("scroll.scroller", globalInterpolate);
    content_obj.scrollTo(0,scroll_amount * scroll_limit)
    if (!has_mouse) d3.select('#density-enter-text').html('Tap and hold density plot to track income percentiles');
    d3.select('#loader-content').style('display','none');
    remove_density_enter ? removeDensityEnter() : toggleLegendOpacity('0.09');
    setInitialState();
    d3.selectAll('.hidden').classed('hidden',false);
    if (is_small){
        const toggle_duration = stop_toolbar_animation ? 0 : 1000;
        toggleToolbar(toggle_duration);
    }
}

function makeHoverRect(){
    hover_rect = d3.select('#hover-group')
        .append('rect')
        .attr('id','hover-rect')
        .attr('x',0)
        .attr('y',-1*margins.top)
        .attr('width',modifiedWidth)
        .attr('height',modifiedHeight+margins.top);
}

function hoverTimeout(){
    if (!is_transitioning && animations_dict[current_selection] != undefined) animations_dict[current_selection].highlightClosest();        
}

function stopHovering(){
    bottom_svg_hover= false;
    if (has_legend && has_entered_mouse) toggleLegendOpacity('1');
    if (animations_dict[current_selection] != undefined) animations_dict[current_selection].removeAllHoveredPercentiles();
    if (touchscreen_timeout){
        clearTimeout(touchscreen_timeout);
        touchscreen_timeout = undefined;
    }
}

function toggleLegendOpacity(opacity_value){
    if (!has_legend) return;
    d3.select('#legend').style('opacity',opacity_value);
}

function hoverActions(){
    makeHoverRect();
    if (!has_mouse){
        hover_rect.on('touchstart',function(){
            x_coordinate = x_scale.invert(d3.mouse(this)[0]);
            touchscreen_timeout = setTimeout(function(){
                if (!has_entered_mouse) removeDensityEnter();
                if (auto_scrolling ) stopScrolling();
                if (has_legend) toggleLegendOpacity('0');
                bottom_svg_hover = true;
                hoverTimeout();
                touchscreen_timeout = undefined;
            },600);
        },{passive:true});
        hover_rect.on('touchend',() => {
            animations_dict[current_selection].clickFunction();
            stopHovering();
        });
        hover_rect.on('touchcancel', stopHovering);
        document.getElementById("hover-rect").addEventListener('touchmove',function(e){
            x_coordinate = x_scale.invert(e.touches[0].clientX - margins.left);
            if (bottom_svg_hover){
                if (auto_scrolling ) stopScrolling();
                if (e.cancelable) e.preventDefault();
                hoverTimeout();
            };
        },{passive:false});
    } else{
        hover_rect.on('mousemove',function(){
            if (!has_entered_mouse) removeDensityEnter();
            x_coordinate = x_scale.invert(d3.mouse(this)[0]);
            if (!bottom_svg_hover && has_legend) toggleLegendOpacity('0');
            bottom_svg_hover = true;
            hoverTimeout();
        });
        hover_rect.on('mousedown',() => {
            if (!is_transitioning && animations_dict[current_selection] != undefined) animations_dict[current_selection].clickFunction()
        });
        hover_rect.on('mouseleave',stopHovering);
    }
}

function makeConstantScales(){
    scaled_bottom = y_scale(0);
    scaled_top = y_scale(global_y_max)-(margins.top);
}

function initializeScrollNums(){
    global_age_num =  (Math.max(Math.min(content_obj.scrollTop / scroll_limit, 1),0)) * (num_ages-1)+min_age;
    global_age_floor = Math.floor(global_age_num); // lower bound 0, upper bound thing
}


function resize(){
    document_body.interrupt();
    animations_dict[current_selection].removeAllHoveredPercentiles();
    removeAxes();
    removePlotsandLines();
    removeYearLinesAndTooltips();
    toolbarChanges();
    // Start adding
    const old_is_small = is_small;
    setHeight(true,is_changing);
    has_legend = d3.select('#legend').style('display')=='flex';
    getAllHeightsAndMargins();
    setDensityEnter();
    makeScales();
    makeConstantScales();
    // Redo margins
    adjustWidthsHeightsAndMargins();
    scaled_global_thresholds = global_thresholds.map(d=>x_scale(d));
    makeAxes();
    addAxisText();
    scaled_global_max = scaled_global_thresholds[global_num_thresholds-1];
    horizontalYearLinesAndText(true);
    makeYearsInfo();
    updateHorizontalYearLinesAndText();
    agesLinesEventListeners();
    drawingFunctions();
    initializeScrollNums();
    animations_dict[0].readyAnimation();
    if (animations_dict[1]) animations_dict[1].readyAnimation();
    d3.selectAll('.hidden').classed('hidden',false);
    resumeScrollIfPaused();
}

function findClosest(arr,target){
    return arr.reduce(function(prev, curr,i) { return (Math.abs(curr - target) <= Math.abs(prev - target) ? curr : prev)});
}

function getAllZeroValues(arr){
    let indexes = [];
    for (let i=0;i<arr.length;i++){
        if (arr[i]===0){
            indexes.push(i)
        } else{
            return indexes
        }
    }
}

function toggleDistributionSelection(){
    const alternative_selection = current_selection==0 ? 1 : 0;
    animations_dict[current_selection].removeAllHoveredPercentiles();
    animations_dict[current_selection].is_selected=false;
    if (animations_dict[1]){
        animations_dict[alternative_selection].is_selected=true;
        if (bottom_svg_hover) animations_dict[alternative_selection].highlightClosest();
        if (show_group_icon) alternative_selection==0 ? showGroupIcon('crimson',0.7) : showGroupIcon('dodgerblue',0.8);
    }
    current_selection = alternative_selection;
}

function updateScrollSpeed(new_num_milliseconds){
    if (auto_scrolling===true)  document_body.interrupt();
    scroll_duration = new_num_milliseconds*(num_ages/48);
    resumeScrollIfPaused();
}

function makeUpperStrings(){
    document.getElementById('group-0-legend-text').innerHTML = generations_scale(animations_selections[0])
    if (checkbox.checked) document.getElementById('group-1-legend-text').innerHTML =  generations_scale(animations_selections[1])
}

function addAxisText(){
    wrapper_svg.append('text')
        .attr('class','hidden axis-label x-axis-label')
        .attr('dominant-baseline',`central`)
        .attr("transform", `translate(${margins.left + (modifiedWidth/2)}, ${totalHeight - (margins.bottom/2) + 11.5})`)
        .text(`Annual income (${max_year} dollars)`);
    wrapper_svg.append("text")
        .attr('class','hidden axis-label y-axis-label')
        .attr('transform',`translate(${margins.left-d3.scaleOrdinal().domain([0,1,2]).range([14.5,17,21])(margins.ind)},${margins.top+modifiedHeight/2}) rotate(-90)`)
        .text("Density");   
}

function adjustYearsTooltips(){
    const cHeight = document.getElementsByClassName('ages-tooltip')[0].clientHeight;
    d3.select("#background-ages").selectAll('.ages-tooltip').style('transform',`translate(0,-${cHeight+tooltips_margin}px)`);
}

function toggleToolbar(transition_d=250){
    if (auto_scrolling) stopScrolling();
    if (transition_d!==0){
        is_changing = true;
        if (toggle_timeout){
            toggle_timeout = undefined;
            clearTimeout(toggle_timeout);
        }
        toggle_timeout = setTimeout(function(){ 
            is_changing = false;
            toggle_timeout = undefined;
        },transition_d+10);
    }
    if (is_expanded==false){
        is_expanded =true;
        toolbar_selector.transition().duration(transition_d).style('left','0px');
        plus_wrapper.transition().duration(transition_d).style('transform','rotate(45deg)');
        icon_wrapper.transition().duration(transition_d).style('left','275px');
        border_hider.transition().duration(transition_d).style('left','272px');
        return;
    }
    is_expanded =false;
    toolbar_selector.transition().duration(transition_d).style('left','-275px');
    icon_wrapper.transition().duration(transition_d).style('left','0px');
    border_hider.transition().duration(transition_d).style('left','-3px');
    if (transition_d===0){
        //fixing rotation bug when transition is instant and zero rotation
        plus_wrapper.style('transform','rotate(0deg)');
    } else{
        plus_wrapper.transition().duration(transition_d).style('transform','rotate(0deg)');
    }
}

function interruptToolbarToggle(){
    toolbar_selector.interrupt();
    plus_wrapper.interrupt();
    icon_wrapper.interrupt();
    border_hider.interrupt();
}

function scrollFloorEqualsScroll(){
    return Math.abs(Math.round(global_age_floor) - global_age_num) < 0.000001;
}

function scrollToAge(age){
    if (auto_scrolling) stopScrolling();
    content_obj.scrollTo(0, ((age - min_age) / (num_ages-1)) * scroll_limit); 
    globalInterpolate();
}

function setWindowEventListeners(){
    document.getElementById('copy-button').addEventListener('mousedown',function(e){
        if (e.buttons==1) generateStateLink();
    });
    document.getElementById('copy-button').addEventListener('touchstart',generateStateLink,{passive:true});
    window.addEventListener('wheel',function(){if (auto_scrolling) stopScrolling()});
    window.addEventListener("mousedown", (e) =>{ if (e.offsetX > document.body.clientWidth) if (auto_scrolling) stopScrolling()});
    window.addEventListener('touchmove',function(){if (auto_scrolling) stopScrolling()},{passive:true});
    window.addEventListener('keydown', function(e) {
        if (e.metaKey || e.key=='Meta' || e.key=='Control') toggle_forward_back = true;
        if (e.code == 'ArrowUp' || e.code == 'ArrowDown') {
            if (e.target!=document.body){
                e.preventDefault();
                if (e.code=='ArrowUp'){
                    content_obj.scrollTo(0,Math.max(content_obj.scrollTop-40,0))
                } else{
                    content_obj.scrollTo(0,Math.min(content_obj.scrollTop+40,scroll_limit))
                }
            };
            if (auto_scrolling) stopScrolling();
        } else if (e.code == 'Space') {
          e.preventDefault();
          auto_scrolling===true ? stopScrolling() : scroll();
        } else if (e.code == 'ArrowRight') {
            if (!toggle_forward_back){
                e.preventDefault();
                if (auto_scrolling) stopScrolling();
                if (global_age_num < max_age){
                    const age_to_scroll = scrollFloorEqualsScroll() ? Math.round(global_age_num) + 1 : global_age_floor + 1;
                    scrollToAge(age_to_scroll);
                }
            }
        } else if (e.code == 'ArrowLeft') {
            if (!toggle_forward_back){
                e.preventDefault();
                if (auto_scrolling) stopScrolling();
                if (global_age_num > min_age){
                    const age_to_scroll = scrollFloorEqualsScroll() ? Math.round(global_age_num) - 1 : global_age_floor;
                    scrollToAge(age_to_scroll);
                }
            }
        } else if (e.code == 'KeyF'){
            if (fullscreen_index != -1) toggleFullScreen();
        }
      });
    window.addEventListener('keyup',function(e){
        toggle_forward_back=  false;
    })
    window.addEventListener('click', function(e){ if (!document.getElementById('toolbar').contains(e.target)) if (is_expanded) toggleToolbar()});
    window.addEventListener('touchstart', function(e){   if (!document.getElementById('toolbar').contains(e.target)) if (is_expanded) toggleToolbar()},{passive:true});
    
    window.onresize = function(){
        if (resize_timeout){
            resize_timeout = undefined;
            clearTimeout(resize_timeout);
        }
        just_resized = true;
        resize();
        resize_timeout = setTimeout(function(){
            just_resized = false;
            resize_timeout = undefined;
        },100)
    };

    window.addEventListener('pagehide', function(){
        storeSavingStr();
    });    

    window.onorientationchange = function(){
        if (!just_resized) resize();
    }

    if (fullscreen_index != -1){
        document.addEventListener('webkitfullscreenchange', fullScreenFunction)
        document.addEventListener('mozfullscreenchange', fullScreenFunction)
        document.addEventListener('fullscreenchange', fullScreenFunction)
        document.addEventListener('MSFullscreenChange', fullScreenFunction);
        document.getElementById("screen-svg").addEventListener("click", toggleFullScreen);
    } else{
        d3.select('#fullscreen-wrapper').style('display','none');
        if (is_small) show_group_icon = true;
    };
}

function setToolbarListeners(){
    document.getElementById("player-svg").addEventListener("click", function(){
        if (is_expanded) toggleToolbar();
        auto_scrolling==true ? stopScrolling() : scroll();
    });

    document.getElementById("restart-svg").addEventListener("mousedown", function(e){
        if (is_expanded) toggleToolbar();
        if (auto_scrolling===true) stopScrolling()
        content_obj.scrollTo(0, 0);
        scroll();
    });

    document.getElementById("myRange").oninput = function() {
        updateScrollSpeed(this.value*-1);
    }

    document.querySelectorAll('.label-class-0').forEach(function(btn) { addRadioListener(btn,0) });
    document.querySelectorAll('.label-class-1').forEach(function(btn) { addRadioListener(btn,1) });

    document.getElementById('workers-selector').addEventListener('change',function(){
        auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
        const worker_group = this.value;
        if (work_type != worker_group){
            work_type = worker_group;
            removeGroup(0);
            if (animations_dict[1]) removeGroup(1);
            updateDistributions();
        }
    });

    document.querySelectorAll('.highlight-label').forEach(function(btn) {clickSelection(btn)})
    document.querySelectorAll('.group-dropdown').forEach(function(btn) { demographicDropdowns(btn) });

    checkbox.addEventListener('change', checkBoxChanger);
    document.getElementById('group-selection-svg').addEventListener('click',function(){
        if (icon_group_currently_shown){
            document.getElementById(`group${current_selection}highlight`).checked=false; 
            document.getElementById(`group${current_selection == 0 ? 1 : 0}highlight`).checked=true;
            toggleDistributionSelection();
        };
    });

    document.getElementById('plus-wrapper').addEventListener('click',function(){toggleToolbar()});
}

function addDistribution(automatic){
    const input_group_1 = document.querySelectorAll('.button-1');
    auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
    second_group_disabled = false;
    d3.select('#legend').style('height','50px');
    if (has_legend) d3.select('#legend-1-wrapper').style('display','flex');
    input_group_1.forEach((btn) => {btn.disabled = false});
    document.querySelectorAll('.group-1-dropdown').forEach(function(btn){btn.disabled=false});
    if (automatic){
        updateDistributions();
        toggleDisable(true);
        if (show_group_icon) showGroupIcon('dodgerblue',0.8);
    }
}

function showGroupIcon(input_color,opacity){
    icon_group_currently_shown = true;
    d3.select('#group-selection-svg').style('opacity',opacity).style('fill',input_color);
    d3.select('#group-selection-wrapper').style('display','block');
}

function removeDistribution(){
    const input_group_1 = document.querySelectorAll('.button-1');
    auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
    second_group_disabled = true;
    input_group_1.forEach((btn) => {btn.disabled = true});
    document.querySelectorAll('.group-1-dropdown').forEach(function(btn){btn.disabled=true});
    d3.select('#legend').style('height','28px');
    if (has_legend) d3.select('#legend-1-wrapper').style('display','none');
    toggleDisable(false);
    removeGroup(1);
    updateDistributions();
    if (show_group_icon){
        icon_group_currently_shown = false;
        d3.select('#group-selection-wrapper').style('display','none');
    }
}

function checkBoxChanger(automatic=true){
    if (checkbox.checked) {
        addDistribution(automatic);
        return;
    }
    removeDistribution();
}

function ageTextListener(btn){
    const age_to_scroll = min_age + (+btn.id.split('-')[2]);
    if (has_mouse){
        btn.addEventListener('mousedown',function(){scrollToAge(age_to_scroll)});
    } else{
        btn.addEventListener('touchstart',function(){scrollToAge(age_to_scroll)},{passive:true});
    }
}
function fullScreenFunction(){
    document.getElementById("fullscreen").style.opacity = +fullscreen;
    document.getElementById("minimize").style.opacity = +(!fullscreen);
    fullscreen = !fullscreen;
}

function resumeScrollIfPaused(){
    if (auto_scrolling){
        auto_scrolling = false;
        scroll();
    }
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
    return -1;
}

function removeDensityEnter(){
    has_entered_mouse = true;
    d3.select('#density-enter').style('display','none');
    d3.select('#density-enter-text').remove();
    density_enter_rect.remove();
    toggleLegendOpacity('1');
}

// Update group selections
function addRadioListener(btn,group_index){
    btn.addEventListener('click', function() {
        if (group_index==0 || second_group_disabled==false){
            const selection_type = this.className.substring(14);
            const selection_id = this.id.slice(0, -1);
            if (animations_selections[group_index] != selection_id){
                auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
                document.getElementById(`select-${selection_type}-${group_index}-${animations_selections[group_index]}`).selected = false;
                document.getElementById(`select-${selection_type}-${group_index}-${selection_id}`).selected = true;
                animations_selections[group_index] = selection_id;
                removeGroup(group_index);
                updateDistributions();
            }
        }
    });
}

function clickSelection(btn){
    btn.addEventListener('click',function(){
        if (animations_dict[1] && current_selection!=+btn.id.slice(-1)) toggleDistributionSelection();
    });
};

function agesLineEventFunction(class_list,id){
    is_hovering_ages = true;
    if (class_list.contains('ages-line-clicked')) {
        const selection_index = class_list.contains('ages-line-0') ? 0 : 1;
        const line_index = +id.split('-')[3];
        addYearTooltips(line_index,selection_index);
    }
}

function agesLinesEventListeners(){
    if (has_mouse){
        d3.selectAll(".ages-line")
        .on('mouseenter', function() {agesLineEventFunction(this.classList,this.id)})
        .on('mouseleave', function(){ cancelYearToolTip(this.classList)});
    } else{
        d3.selectAll(".ages-line")
        .on('touchstart', function() {agesLineEventFunction(this.classList,this.id)},{passive:true})
        .on('touchend', function(){ cancelYearToolTip(this.classList)})
        .on('touchcancel', function(){cancelYearToolTip(this.classList)});
    }
    document.querySelectorAll('.age-text').forEach(function(btn) { ageTextListener(btn) });
};

function cancelYearToolTip(class_list_name){
    if (class_list_name.contains('ages-line-clicked')) {
        is_hovering_ages = false;
        toggleLegendOpacity('1');
        const selection_index = class_list_name.contains('ages-line-0') ? 0 : 1;
        removeYearTooltips();
        density_tooltip.style('opacity','0');
        animations_dict[selection_index].tooltip_percentile = undefined;
    }
}

function makeNewAccessingString(group_index){
    if (group_index===1 && !checkbox.checked) return undefined;
    return selectionsToAccessingString(group_index);
}


function selectionsToAccessingString(group_index){
    return `./processed_data/${work_type}/${animations_selections[group_index]}/data.json`
}

function demographicDropdowns(btn){
    btn.addEventListener('change',function(){
        const this_id = this.id;
        const select_index = +this_id[6];
        if (select_index==0 || second_group_disabled==false){
            const demographic_group = this.value;
            const demographic_type = this_id.slice(8);
            if (animations_selections[select_index] != demographic_group){
                auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
                document.getElementById(`radio-${demographic_type}-${select_index}-${animations_selections[select_index]}`).checked = false;
                document.getElementById(`radio-${demographic_type}-${select_index}-${demographic_group}`).checked = true;
                animations_selections[select_index] = demographic_group;
                removeGroup(select_index);
                updateDistributions();
            }
        }
    })
}

function toggleFullScreen(){ fullscreen ? closeFullscreen(fullscreen_index) : openFullscreen(fullscreen_index)};

function setDensityEnter(){
    if (!has_entered_mouse){
        density_enter_rect
        .attr('y',ages_line_height)
        .attr("width",totalWidth)
        .attr('height',totalHeight);
    }
}

function getMargins(){
    if (window.matchMedia('(max-width: 785px), (max-height:515px)').matches) return {top: 40, right: 35, bottom: 60, left: 80,ind:0}; // Small browsers
    if (window.matchMedia('(min-width:1350px)').matches) return {top: 40, right: 40, bottom: 80, left: 100,ind:2}; // Large browsers
    return  {top: 40, right: 40, bottom: 70, left: 85,ind:1};
}

function toggleDisable(turn_on){
    if (turn_on || current_selection==1){
        toggleDistributionSelection();
        document.getElementById('group0highlight').checked=!turn_on;
        document.getElementById('group1highlight').checked=turn_on;
    }
    document.getElementById('group0highlight').disabled=!turn_on;
    document.getElementById('group1highlight').disabled=!turn_on;
}

function adjustWidthsHeightsAndMargins(){
    wrapper_wrapper.attr("width",totalWidth).attr("height",totalHeight+ages_line_height);
    wrapper_svg.attr("width",totalWidth).attr("height",totalHeight);
    wrapper_svg.select('#rect-svg').attr("width",totalWidth).attr("height",totalHeight-margins.top).attr("transform","translate(0," + margins.top + ")");
    wrapper_svg.select('#rect-svg2').attr("width",totalWidth-(margins.left)).attr("height",totalHeight-margins.bottom).attr("transform","translate("+margins.left+",0)");
    wrapper_with_adjusted_margins.attr("transform","translate(" + margins.left + "," + margins.top + ")");
    curr_age_line.attr('y1',ages_line_height).attr('y2',ages_line_height).attr('x2',margins.left-4.5).attr('x1',totalWidth-margins.right);
    ages_svg.attr("transform", "translate(" + margins.left + ",0)");
    hover_rect.attr('x',0).attr('y',-1*margins.top).attr('width',modifiedWidth).attr('height',modifiedHeight+margins.top);
    d3.select('#density-enter-inner').style("width",`${totalWidth-(margins.left+margins.right)}px`).style("height",`${totalHeight-margins.bottom}px`).style("transform",`translate(${margins.left}px,0)`);
}
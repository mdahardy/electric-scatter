function updateGroupOnSetup(input_str,group_index){
    animations_selections[group_index]['race'] = race_id_dict[input_str[0]];
    animations_selections[group_index]['sex']= sex_id_dict[input_str[1]];
    animations_selections[group_index]['age'] = age_id_dict[input_str[2]];
    animations_filenames[group_index] =  makeNewAccessingString(group_index);
    document.querySelectorAll(`.button-${group_index}`).forEach(btn => {btn.checked=false});
    document.querySelectorAll(`.selector-${group_index}`).forEach(btn => {btn.selected=false});
    document.getElementById(`select-race-${group_index}-${animations_selections[group_index]['race']}`).selected = true;
    document.getElementById(`select-sex-${group_index}-${animations_selections[group_index]['sex']}`).selected = true;
    document.getElementById(`select-age-${group_index}-${animations_selections[group_index]['age']}`).selected = true;
    document.getElementById(`radio-race-${group_index}-${animations_selections[group_index]['race']}`).checked = true;
    document.getElementById(`radio-sex-${group_index}-${animations_selections[group_index]['sex']}`).checked = true;
    document.getElementById(`radio-age-${group_index}-${animations_selections[group_index]['age']}`).checked = true;
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
        years_distance = is_small ? 48 : 62;
        years_lower = years_distance * (num_years-1);
        scroll_limit = years_lower;
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
    return  getKeyByValue(race_id_dict, animations_selections[input_index]['race']) + 
    getKeyByValue(sex_id_dict, animations_selections[input_index]['sex']) + 
    getKeyByValue(age_id_dict, animations_selections[input_index]['age']);
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
        // Make a text area div pop up
        // HIghlight it
        // One button for OK, or click anywhere not on div, close
        // Also, for these browsers, make it say "Get copy link"
        // Test with xcode to increase speed
        d3.select("#copy-button").style('transform','none');
        result = prompt('Highlight and copy', string); // eslint-disable-line no-alert
    }
  }

function generateStateLink(){
    if (copy_timeout){
        clearTimeout(copy_timeout)
        copy_timeout = undefined;
    }
     const id0 =  getKeyByValue(workers_id_dict, animations_selections[0]['work_type']) + getGroupString(0);
     const s = Math.round(1000 * content_obj.scrollTop / scroll_limit);
     let p0 = '';
     for (clicked_ind0 of animations_dict[0].clicked_indices) p0 += indexToTwoDigits(clicked_ind0);
     let saving_str = `?id0=${id0}` + ((s==0) ? '' : `&s=${s}`) + ((p0=='') ? '' : `&p0=${p0}`)
     if (animations_dict[1]){
        let p1 = '';
        for (clicked_ind1 of animations_dict[1].clicked_indices) p1 += indexToTwoDigits(clicked_ind1);
        saving_str += `&id1=${ getGroupString(1)}`  + ((p1=='') ? '' : `&p1=${p1}`);
     }
     copyToClipboard(`https://electricscatter.com/i${saving_str}`);
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
                            clearTimeout(wheel_timeout);
                            wheel_timeout = undefined;
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

async function simpleUpdate(f0,input_global_counter,f1=undefined){
    if (!showing_loader && has_entered_mouse){
        showing_loader = true;
        d3.select("#density-enter").style('display','flex');
        d3.select("#density-loader").style('display','block');
    }
    is_transitioning=true;
    if (animation_timeout){
        clearTimeout(animation_timeout);
        animation_timeout = undefined;
    }
    let changing_axes = true;
    if (f0 != animations_filenames[0]){
        const new_data0 = await d3.json(f0);
        if (input_global_counter==global_counter){
            animations_dict[0] = new IncomeAnimation(0,new_data0);
            shown_distributions[0] = false;
            animations_filenames[0] = f0;
        }
    }
    if (f1 != animations_filenames[1]){
        const new_data1 = f1==undefined ? undefined : await d3.json(f1);
        if (input_global_counter == global_counter){
            animations_dict[1] =   f1==undefined ? undefined : new IncomeAnimation(1,new_data1);
            animations_filenames[1] = f1;
            shown_distributions[1] = false;
        }
    }
    if (input_global_counter == global_counter){
        if (has_entered_mouse){
            showing_loader = false;
            d3.select("#density-enter").style('display','none');
            d3.select("#density-loader").style('display','none');
        }
        makeUpperStrings();
        const [old_x_max,old_y_max] = [global_x_max,global_y_max];
        const old_x_scale = x_scale;
        setGlobalMaxes();
        old_x_max != global_x_max || old_y_max != global_y_max ? makeScales() : changing_axes = false;
        if (old_y_max!=global_y_max) makeConstantScales();
        if (old_x_max!=global_x_max) scaled_global_thresholds = global_thresholds.map(d=>x_scale(d));
        if (shown_distributions[0]) animations_dict[0].makeInterpolatingDictionaries();
        if (shown_distributions[1]) animations_dict[1].makeInterpolatingDictionaries();
        changing_axes ? animateTransition(old_x_scale) : finishTransition();
    }
}

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
    drawLinesAndDots(animations_dict[group_index].data_obj.incomes_dict,group_index);
}

function redrawGroup(group_index){
    animations_dict[group_index].makeInterpolatingDictionaries();
    animations_dict[group_index].redraw();
}

function finishTransition(){
    cutAndScaleThresholds();
    updateYearsGridLines(x_scale.ticks(num_x_ticks).slice(1));
    if (animations_filenames[0]) finishGroup(0);
    if (animations_filenames[1]) finishGroup(1);
    wrapper_with_adjusted_margins.selectAll('.hidden').classed('hidden',false);
    yearsLinesEventListeners();
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
        const curr_x_max = d3.max([animations_dict[0].data_obj.x_max,animations_dict[1].data_obj.x_max])+30000;
        [global_x_max,global_y_max] = [curr_x_max - (curr_x_max % 2000), d3.max([animations_dict[0].data_obj.y_max,animations_dict[1].data_obj.y_max])];
        return;
    }
    const curr_x_max = animations_dict[0].data_obj.x_max+30000;
    [global_x_max,global_y_max] =  [curr_x_max - (curr_x_max % 2000),animations_dict[0].data_obj.y_max];
}

function removeGroup(group_index){
    wrapper_with_adjusted_margins.selectAll(`.density-group-${group_index}`).remove();
    years_svg.selectAll(`.years-line-${group_index}`).remove();
}

function drawLinesAndDots(income_dict,plotting_index){    
    years_svg
        .selectAll(`.year-plots-${plotting_index}`)
        .data(income_dict)
        .enter().append("g")
        .append('path')
        .attr("d", d => line_function(d.vals))
        .attr('class',(d,i) => `year-info years-line years-line-${plotting_index}` + (i==animations_dict[0].num_lines-1 ? ` background-line` : ''))
        .attr('id',d=> `years-line-${plotting_index}-${d.name}`);

    years_svg
        .append('path')
        .attr("d", line_function(income_dict[animations_dict[0].num_lines-1].vals))
        .attr('class', `year-info years-line years-line-${plotting_index} average-line`)
        .attr('id',d=> `years-line-${plotting_index}-${animations_dict[0].num_lines}`);
}

function makeYearsSvg(){
    years_svg_wrapper = d3.select("#background-years")
            .append("svg")
            .attr('id','years-svg')
            .attr("width",'100%')
            .attr("height",'100%');
    years_svg = years_svg_wrapper
            .append("g")
            .attr("transform", "translate(" + margins.left + ",0)");
}

function makeYearsGridLines(){
    const years_lower_padding = years_lower + years_line_height;
    years_svg.selectAll(".years-grid-line")
        .data(x_scale.ticks(num_x_ticks).slice(1))
        .enter()
        .append("line")
        .attr("class","year-info years-grid-line hidden")
        .attr("x1",d=> years_x_scale(d))
        .attr("x2",d=> years_x_scale(d))
        .attr("y1", years_line_height)
        .attr("y2", years_lower_padding);
}

function makeYearsInfo(){
    line_function = d3.line().x(function(d) {return years_x_scale(d) }).y(function(d,i) { return years_y_scale(i) });
    const scaled_global_max = scaled_global_thresholds[global_num_thresholds-1];
    const zero_scaled = x_scale(0);
    for (let i=0;i<num_years;i++){
        let curr_years_scaled = years_y_scale(i);
            years_svg.append('line')
                .attr('y1',curr_years_scaled)
                .attr('y2',curr_years_scaled)
                .attr('x1',zero_scaled)
                .attr('x2',scaled_global_max)
                .attr('class','hidden year-line year-info')

            years_svg_wrapper.append('text')
                .attr('y',curr_years_scaled)
                .attr('x',margins.left-12)
                .attr('class',`hidden year-text year-info`)
                .attr('id',`year-text-${i}`)
                .attr('dominant-baseline',`central`)
                .text(String(i+1970));
    }

    makeYearsGridLines();
    drawLinesAndDots(animations_dict[0].data_obj.incomes_dict,0);
    if (animations_dict[1]!=undefined) drawLinesAndDots(animations_dict[1].data_obj.incomes_dict,1);
}

function makeYearsTooltips(){
    const base_height = (+d3.select('#title-div').style('height').slice(0,-2)) + 45;
    d3.select("#background-years").selectAll('.years-tooltip')
        .data(new Array(num_years).fill(-1))
        .enter()
        .append('div')
        .html('$100,000')
        .attr('class',`years-tooltip hidden`)
        .style('top',(d,i)=>`${years_y_scale(i)+base_height}px`);
    adjustYearsTooltips();
}




// Make an object for each animation
class IncomeAnimation {
    constructor(plotting_num,data){
        this.plotting_num = plotting_num;
        this.data_obj = data;
        this.x_max = data['x_max'];
        this.y_max = data['y_max'];
        this.num_lines = data.incomes_dict.length;
        this.curve = undefined;
        this.clip_path = undefined;
        this.drawing_dictionaries = undefined;
        this.incomes_dictionaries = undefined;
        this.interpolated_incomes = undefined;
        this.hover_indices = [];
        this.clicked_indices = [];
        this.is_selected = current_selection==plotting_num;
        this.hover_info = [-1,-1];
        this.vertical_lines = undefined;
        this.tooltip_percentile = undefined;
        this.ready_to_draw=false;
    }

    readyAnimation(){
        this.makeInterpolatingDictionaries();
        this.initialPlotsAndLines();
        this.ready_to_draw=true;
    }

    makeInterpolatingDictionaries(){
        const drawing_dict = {};
        const incomes_dict = {};
        const num_minus_one = num_years-1;
        for (let index_i=0;index_i<num_minus_one;index_i++){
            drawing_dict[index_i] = d3.interpolateArray(this.data_obj['densities'][index_i].slice(0,global_num_thresholds).map(d=>y_scale(d)),this.data_obj['densities'][index_i+1].slice(0,global_num_thresholds).map(d=>y_scale(d)));
            incomes_dict[index_i] = d3.interpolateArray(this.data_obj['incomes'][index_i],this.data_obj['incomes'][index_i+1]);
        }
        drawing_dict[num_minus_one] = d3.interpolateArray(this.data_obj['densities'][num_minus_one].slice(0,global_num_thresholds).map(d=>y_scale(d)),this.data_obj['densities'][num_minus_one].slice(0,global_num_thresholds).map(d=>y_scale(d)));
        incomes_dict[num_minus_one] =  d3.interpolateArray(this.data_obj['incomes'][num_minus_one],this.data_obj['incomes'][num_minus_one]);
        this.drawing_dictionaries = drawing_dict;
        this.incomes_dictionaries = incomes_dict;
    }

    interpolate(){
        const residual = global_scroll_num - global_scroll_floor;
        return [this.drawing_dictionaries[global_scroll_floor](residual),this.incomes_dictionaries[global_scroll_floor](residual)];
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
            .attr('class',(d,i) => `hidden not-axes density-group-${this_obj.plotting_num} vertical-line vertical-line-${this_obj.plotting_num} vertical-line-${this_obj.plotting_num}-${i}` + (i==this.num_lines-1 ? ` average-line` : ''))
            .attr('y1',scaled_bottom)
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
            } else if (is_hovering_years){
                this.showTooltip(this.tooltip_percentile,false)
            };
        }
    }

    showTooltip(percentile_index,include_income_amount){
        const percentile_string = ((percentile_index+1)*2 ).toFixed(0);
        density_tooltip
            .html(`<p>${percentile_index != this.num_lines - 1 ? (`${percentile_string}${(percentile_string.slice(-1) == '2' ? 'nd' : 'th')} percentile` ) : 'Average'}</p>`+ (include_income_amount ? `<p>$${this.interpolated_incomes[percentile_index].toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>` : ''))
            .style('left',`${this.interpolated_incomes[percentile_index]<=(global_x_max/2) ? x_scale(this.interpolated_incomes[percentile_index])+margins.left + tooltips_margin : x_scale(this.interpolated_incomes[percentile_index])+margins.left - (+density_tooltip.style('width').slice(0,-2)) - tooltips_margin}px`)
            .style("opacity","1");
    }

    addHoveredPercentile(percentile_index){
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-hovered-${this.plotting_num}`,true);
        if (this.clicked_indices.includes(percentile_index)) {
            years_svg.select(`#years-line-${this.plotting_num}-${percentile_index}`).classed(`years-line-hovered-${this.plotting_num}`,true);
            if (percentile_index==this.num_lines-1) years_svg.select(`#years-line-${this.plotting_num}-${percentile_index+1}`).classed(`years-line-hovered-${this.plotting_num}`,true);
        };
    }

    removeHoveredPercentile(percentile_index){
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-hovered-${this.plotting_num}`,false);
        if (this.clicked_indices.includes(percentile_index)){
            years_svg.select(`#years-line-${this.plotting_num}-${percentile_index}`).classed(`years-line-hovered-${this.plotting_num}`,false);
            if (percentile_index==this.num_lines-1) years_svg.select(`#years-line-${this.plotting_num}-${percentile_index+1}`).classed(`years-line-hovered-${this.plotting_num}`,false);
        }
    }

    addClickedPercentile(percentile_index){
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-clicked-${this.plotting_num} highlight-class-${this.plotting_num}`,true).classed('line-not-clicked',false);
        years_svg.select(`#years-line-${this.plotting_num}-${percentile_index}`).classed(`years-line-clicked years-line-clicked-${this.plotting_num}`,true);
        if (percentile_index==this.num_lines-1) years_svg.select(`#years-line-${this.plotting_num}-${percentile_index+1}`).classed(`years-line-clicked years-line-clicked-${this.plotting_num}`,true);
    }

    addHoverOnClick(percentile_index){
        years_svg.select(`#years-line-${this.plotting_num}-${percentile_index}`).classed(`years-line-hovered-${this.plotting_num}`,true);
        this.clicked_indices.push(percentile_index);
    }

    removeClickedPercentile(percentile_index){
        const curr_index = this.clicked_indices.indexOf(percentile_index);
        this.clicked_indices.splice(curr_index,1)
        lines_svg_dict[this.plotting_num].select(`.vertical-line-${this.plotting_num}-${percentile_index}`).classed(`line-clicked-${this.plotting_num} highlight-class-${this.plotting_num}`,false).classed('line-not-clicked',true);
        years_svg.select(`#years-line-${this.plotting_num}-${percentile_index}`).classed(`years-line-hovered-${this.plotting_num} years-line-clicked years-line-clicked-${this.plotting_num}`, false);
        if (percentile_index==this.num_lines-1) years_svg.select(`#years-line-${this.plotting_num}-${percentile_index+1}`).classed(`years-line-hovered-${this.plotting_num} years-line-clicked years-line-clicked-${this.plotting_num}`, false);
    }

    removeAllHoveredPercentiles(){
        for (let i = this.hover_indices.length-1;i>=0;i--) this.removeHoveredPercentile(this.hover_indices[i]);
        this.hover_indices = [];
        this.hover_info=[-1,-1];
        if (!is_hovering_years) {
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

function addYearTooltips(input_index,selection_index){
    const left_right = animations_dict[selection_index].interpolated_incomes[input_index] <= animations_dict[selection_index].interpolated_incomes[36];
    d3.select("#background-years").selectAll('.years-tooltip')
        .data(animations_dict[selection_index].data_obj.incomes_dict[input_index].vals)
        .html(d=>`$${d.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`)
        .style('left',function(d){ return left_right ? `${years_x_scale(d)+margins.left + tooltips_margin}px` : `${years_x_scale(d)+margins.left - this.clientWidth - tooltips_margin}px`})
        .style('opacity','1');
}

function removeYearTooltips(){
    d3.select("#background-years").selectAll('.years-tooltip').style('opacity','0')
}

function widthAndHeightMinusMargins(margin_var,total_width,total_height){
    const modified_width = (total_width-margin_var.right) - margin_var.left;
    const modified_height = (total_height - margin_var.top) - margin_var.bottom;
    return [modified_width,modified_height]
}

function getWidthAndHeight(){
    const boundingBox = document.getElementById('density-div').getBoundingClientRect();
    return [boundingBox.width,boundingBox.height-years_line_height];
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
    years_svg.selectAll('.years-grid-line').remove();
    years_svg_wrapper.selectAll('.year-info').remove();
    d3.select('#background-years').selectAll('.years-tooltip').remove();
}

function makeScales(){
    x_scale = d3.scaleLinear().domain([0, global_x_max]).range([0, modifiedWidth]);
    y_scale = d3.scaleLinear().domain([0, global_y_max]).range([modifiedHeight,0]);
    years_x_scale = d3.scaleLinear().domain([0,global_x_max]).range([0,modifiedWidth]);
    years_y_scale = i => (i*years_distance) + years_line_height;
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
    const grid_selection = years_svg.selectAll(".years-grid-line").data(grid_data,d=>d);    
    const years_lower_padding = years_lower + years_line_height;
    grid_selection.enter()
        .append('line')
        .attr("class","years-grid-line")
        .attr("y1", years_line_height)
        .attr("y2", years_lower_padding)
        .merge(grid_selection)
        .attr("x1", function(d){ return years_x_scale(d)})
        .attr("x2", function(d){ return years_x_scale(d)});
    grid_selection.exit().remove();
}

function updateYearsLines(updating_index){
    years_svg.selectAll(`.years-line-${updating_index}`)
        .data(animations_dict[updating_index].data_obj.incomes_dict)
        .attr("d", function(d){ return line_function(d.vals)});
    years_svg.select(`#years-line-${updating_index}-${animations_dict[0].num_lines}`).attr('d',line_function(animations_dict[updating_index].data_obj.incomes_dict[animations_dict[updating_index].num_lines-1].vals))
}

function drawingFunctions(){
    curveFunction = d3.area().curve(d3.curveBasis).x((d,i) => scaled_global_thresholds[i]).y1(d=>d).y0(scaled_bottom);
    clipFunction = d3.area().curve(d3.curveBasis).x((d,i) => scaled_global_thresholds[i]).y1(d=>d).y0(scaled_top);
}

function globalInterpolate(){
    global_scroll_num =  (Math.max(Math.min(content_obj.scrollTop / scroll_limit, 1),0)) * (num_years-1);
    global_scroll_floor = Math.floor(global_scroll_num); // lower bound 0, upper bound thing
    animations_dict[0].redraw();
    if (animations_dict[1]!=undefined) animations_dict[1].redraw();
}

function addClickedPercentiles(percentile_vec,input_ind){
    for (p_i of percentile_vec){
        animations_dict[input_ind].clicked_indices.push(p_i)
        animations_dict[input_ind].addClickedPercentile(p_i);
    }
}

async function initialSetup(fname0,fname1=undefined,scroll_amount=undefined,percentile_vec0=[],percentile_vec1=[],remove_density_enter=false){
    animations_dict[0] = new IncomeAnimation(0,await d3.json(fname0));
    num_years = animations_dict[0].data_obj.incomes.length;
    if (fname1) animations_dict[1] = new IncomeAnimation(1,await d3.json(fname1));
    setHeight();
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
    makeYearsInfo();
    makeYearsTooltips();
    yearsLinesEventListeners();
    makeUpperStrings();
    addClickedPercentiles(percentile_vec0,0)
    if (fname1)  addClickedPercentiles(percentile_vec1,1)
    d3.select(has_toolbar ? '#content' : window).on("scroll.scroller", globalInterpolate);
    if (scroll_amount) content_obj.scrollTo(0,scroll_amount * scroll_limit)
    if (!has_mouse) d3.select('#density-enter-text').html('Tap and hold density plot to track income percentiles');
    d3.select('#loader-content').style('display','none');
    remove_density_enter ? removeDensityEnter() : d3.select('#legend').style('opacity','0.09');
    d3.selectAll('.hidden').classed('hidden',false);
    if (is_small) toggleToolbar(1000);
}

function makeHoverRect(){
    hover_rect = hover_group
        .append('rect')
        .attr('id','hover-rect')
        .attr('x',0)
        .attr('y',-1*margins.top)
        .attr('width',modifiedWidth)
        .attr('height',modifiedHeight+margins.top);
}

function hoverTimeout(){
    if (!is_transitioning) animations_dict[current_selection].highlightClosest();        
}

function stopHovering(){
    bottom_svg_hover= false;
    if (has_legend && has_entered_mouse) d3.select('#legend').style('opacity','1');
    animations_dict[current_selection].removeAllHoveredPercentiles();
    if (touchscreen_timeout){
        clearTimeout(touchscreen_timeout);
        touchscreen_timeout = undefined;
    }
}

function hoverActions(){
    makeHoverRect();
    if (!has_mouse){
        hover_rect.on('touchstart',function(){
            x_coordinate = x_scale.invert(d3.mouse(this)[0]);
            touchscreen_timeout = setTimeout(function(){
                if (!has_entered_mouse) removeDensityEnter();
                if (auto_scrolling ) stopScrolling();
                if (has_legend) d3.select('#legend').style('opacity','0');
                bottom_svg_hover = true;
                hoverTimeout();
                touchscreen_timeout = undefined;
            },600);
        });
        hover_rect.on('touchend',() => {
            animations_dict[current_selection].clickFunction();
            stopHovering();
        });
        hover_rect.on('touchcancel', stopHovering);
        document.getElementById("hover-rect").addEventListener('touchmove',function(e){
            x_coordinate = x_scale.invert(e.touches[0].clientX - margins.left);
            if (bottom_svg_hover){
                if (auto_scrolling )stopScrolling();
                if (e.cancelable) e.preventDefault();
                hoverTimeout();
            };
        },{passive:false});
    } else{
        hover_rect.on('mousemove',function(){
            if (!has_entered_mouse) removeDensityEnter();
            x_coordinate = x_scale.invert(d3.mouse(this)[0]);
            if (!bottom_svg_hover && has_legend) d3.select('#legend').style('opacity','0');
            bottom_svg_hover = true;
            hoverTimeout();
        });
        hover_rect.on('mousedown',() => {animations_dict[current_selection].clickFunction()});
        hover_rect.on('mouseleave',stopHovering);
    }
}

function makeConstantScales(){
    scaled_bottom = y_scale(0);
    scaled_top = y_scale(global_y_max)-(margins.top);
}

function initializeScrollNums(){
    global_scroll_num =  (Math.max(Math.min(content_obj.scrollTop / scroll_limit, 1),0)) * (num_years-1);
    global_scroll_floor = Math.floor(global_scroll_num); // lower bound 0, upper bound thing
}


function resize(){
    document_body.interrupt();
    animations_dict[current_selection].removeAllHoveredPercentiles();
    removeAxes();
    removePlotsandLines();
    removeYearLinesAndTooltips();
    toolbarChanges();
    // Start adding
    setHeight(true,is_changing);
    has_legend = d3.select('#legend').style('display')=='flex';
    [totalWidth,totalHeight] = getWidthAndHeight();
    margins = getMargins();
    [modifiedWidth,modifiedHeight] = widthAndHeightMinusMargins(margins,totalWidth,totalHeight);
    setDensityEnter();
    makeScales();
    makeConstantScales();
    // Redo margins
    adjustWidthsHeightsAndMargins();
    scaled_global_thresholds = global_thresholds.map(d=>x_scale(d));
    makeAxes();
    addAxisText();
    makeYearsInfo();
    makeYearsTooltips();
    yearsLinesEventListeners();
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
        if (show_group_icon) (alternative_selection==0 ? d3.select('#group-selection-svg').style('opacity','0.7').style('fill','crimson') : d3.select('#group-selection-svg').style('opacity','0.8').style('fill','dodgerblue'));
    }
    current_selection = alternative_selection;
}

function updateScrollSpeed(new_num_milliseconds){
    if (auto_scrolling===true)  document_body.interrupt();
    scroll_duration = new_num_milliseconds;
    resumeScrollIfPaused();
}

function makeUpperStrings(){
    document.getElementById('group-0-legend-text').innerHTML = race_scale(animations_selections[0]['race']) + sex_scale(animations_selections[0]['sex']) + age_scale(animations_selections[0]['age']);
    if (animations_dict[1]) document.getElementById('group-1-legend-text').innerHTML = race_scale(animations_selections[1]['race']) + sex_scale(animations_selections[1]['sex']) + age_scale(animations_selections[1]['age']) ;
}

function addAxisText(){
    wrapper_svg.append('text')
        .attr('class','hidden axis-label x-axis-label')
        .attr('dominant-baseline',`central`)
        .attr("transform", `translate(${margins.left + (modifiedWidth/2)}, ${totalHeight - (margins.bottom/2) + 11.5})`)
        .text('Annual income (2019 dollars)');
    wrapper_svg.append("text")
        .attr('class','hidden axis-label y-axis-label')
        .attr('transform',`translate(${margins.left-d3.scaleOrdinal().domain([0,1,2]).range([14.5,17,21])(margins.ind)},${margins.top+modifiedHeight/2}) rotate(-90)`)
        .text("Density");   
}

function adjustYearsTooltips(){
    const cHeight = document.getElementsByClassName('years-tooltip')[0].clientHeight;
    d3.select("#background-years").selectAll('.years-tooltip').style('transform',`translate(0,-${cHeight+tooltips_margin}px)`);
}

function toggleToolbar(transition_d=250){
    if (auto_scrolling) stopScrolling();
    is_changing = true;
    if (toggle_timeout){
        clearTimeout(toggle_timeout);
        toggle_timeout = undefined;
    }
    toggle_timeout = setTimeout(function(){ 
        is_changing = false;
        toggle_timeout = undefined;
    },transition_d+10)
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
    plus_wrapper.transition().duration(transition_d).style('transform','rotate(0deg)');
    icon_wrapper.transition().duration(transition_d).style('left','0px');
    border_hider.transition().duration(transition_d).style('left','-3px');
}

function interruptToolbarToggle(){
        toolbar_selector.interrupt();
        plus_wrapper.interrupt();
        icon_wrapper.interrupt();
        border_hider.interrupt();
}


function setWindowEventListeners(){
    document.getElementById('copy-button').addEventListener('mousedown',function(e){
        if (e.buttons==1) generateStateLink();
    });
    document.getElementById('copy-button').addEventListener('touchstart',generateStateLink);
    window.addEventListener('wheel',function(){if (auto_scrolling) stopScrolling()});
    window.addEventListener("mousedown", (e) =>{ if (e.offsetX > document.body.clientWidth) if (auto_scrolling) stopScrolling()});
    window.addEventListener('touchmove',function(){if (auto_scrolling) stopScrolling()});
    window.addEventListener('keydown', function(e) {
        if (e.keyCode == 38 || e.keyCode == 40) {
            if (e.target!=document.body){
                e.preventDefault();
                if (e.keyCode==38){
                    content_obj.scrollTo(0,Math.max(content_obj.scrollTop-40,0))
                } else{
                    content_obj.scrollTo(0,Math.min(content_obj.scrollTop+40,scroll_limit))
                }
            };
            if (auto_scrolling) stopScrolling();
        } else if (e.keyCode == 32) {
          e.preventDefault();
          auto_scrolling===true ? stopScrolling() : scroll();
        } else if (e.keyCode == 39) {
            if (!toggle_forward_back){
                e.preventDefault();
                if (auto_scrolling) stopScrolling();
                if (global_scroll_num < num_years-1) content_obj.scrollTo(0,((global_scroll_floor+1)/(num_years-1)) * scroll_limit);   
            }
        } else if (e.keyCode == 37) {
            if (!toggle_forward_back){
                e.preventDefault();
                if (auto_scrolling) stopScrolling();
                if (global_scroll_num > 0 ) global_scroll_num==global_scroll_floor  ? content_obj.scrollTo(0,((global_scroll_floor-1)/(num_years-1)) * scroll_limit) : content_obj.scrollTo(0,((global_scroll_floor)/(num_years-1)) * scroll_limit);
            }
        } else if (e.keyCode == 70){
            if (fullscreen_index != -1) toggleFullScreen();
        }
        if (e.metaKey || e.keyCode==18) toggle_forward_back=  true;

      });
    window.addEventListener('keyup',function(e){
        if (e.metaKey || e.keyCode==18) toggle_forward_back=  false;
    })
    window.addEventListener('click', function(e){ if (!document.getElementById('toolbar').contains(e.target)) if (is_expanded) toggleToolbar()});
    window.addEventListener('touchstart', function(e){   if (!document.getElementById('toolbar').contains(e.target)) if (is_expanded) toggleToolbar()});
    
    window.onresize = function(){
        if (resize_timeout){
            clearTimeout(resize_timeout);
            resize_timeout = undefined;
        }
        just_resized = true;
        resize();
        resize_timeout = setTimeout(function(){
            just_resized = false;
            resize_timeout = undefined;
        },100)
    };

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

function yearTextListener(btn){
    btn.addEventListener('mousedown',function(){
        if (auto_scrolling) stopScrolling();
        content_obj.scrollTo(0,((+this.id.split('-')[2])/(num_years-1))*scroll_limit )
    });
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
        if (animations_selections[0]['work_type'] != worker_group){
            animations_selections[0]['work_type'] = worker_group;
            animations_selections[1]['work_type'] = worker_group;
            removeGroup(0);
            if (animations_dict[1]){
                removeGroup(1);
                global_counter = global_counter+1;
                simpleUpdate(makeNewAccessingString(0),global_counter,makeNewAccessingString(1));
            } else{
                global_counter = global_counter+1;
                simpleUpdate(makeNewAccessingString(0),global_counter,undefined)
            }
        }
    });

    document.querySelectorAll('.highlight-label').forEach(function(btn) {clickSelection(btn)})
    document.querySelectorAll('.group-dropdown').forEach(function(btn) { demographicDropdowns(btn) });

    document.querySelector('input[type="checkbox"]').addEventListener('change', checkBoxChanger)

    document.getElementById('group-selection-svg').addEventListener('click',function(){
        if (icon_group_currently_shown){
            document.getElementById(`group${current_selection}highlight`).checked=false; 
            document.getElementById(`group${current_selection == 0 ? 1 : 0}highlight`).checked=true;
            toggleDistributionSelection();
        };
    });

    document.getElementById('plus-wrapper').addEventListener('click',function(){toggleToolbar()});
}

function checkBoxChanger(automatic=true){
    const input_group_1 = document.querySelectorAll('.button-1');
    const checkbox = document.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
        auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
        second_group_disabled = false;
        d3.select('#legend').style('height','50px');
        if (has_legend) d3.select('#legend-1-wrapper').style('display','flex');
        input_group_1.forEach((btn) => {btn.disabled = false});
        document.querySelectorAll('.group-1-dropdown').forEach(function(btn){btn.disabled=false});
        if (automatic){
            global_counter = global_counter+1;
            simpleUpdate(animations_filenames[0],global_counter,makeNewAccessingString(1));
            toggleDisable(true);
        }
        if (show_group_icon){
            icon_group_currently_shown = true;
            d3.select('#group-selection-svg').style('opacity','0.8').style('fill','dodgerblue');
            d3.select('#group-selection-wrapper').style('display','block');
        }
    } else {
            auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
            second_group_disabled = true;
            input_group_1.forEach((btn) => {btn.disabled = true});
            document.querySelectorAll('.group-1-dropdown').forEach(function(btn){btn.disabled=true});
            d3.select('#legend').style('height','28px');
            if (has_legend) d3.select('#legend-1-wrapper').style('display','none');
            toggleDisable(false);
            removeGroup(1);
            global_counter = global_counter+1;
            simpleUpdate(animations_filenames[0],global_counter,undefined);
            if (show_group_icon){
                icon_group_currently_shown = false;
                d3.select('#group-selection-wrapper').style('display','none');
            }
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
    d3.select('#legend').style('opacity','1');
}

// Update group selections
function addRadioListener(btn,group_index){
    btn.addEventListener('click', function() {
        if (group_index==0 || second_group_disabled==false){
            const selection_type = this.className.substring(14);
            const selection_id = this.id.slice(0, -1);
            if (animations_selections[group_index][selection_type] != selection_id){
                auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
                document.getElementById(`select-${selection_type}-${group_index}-${animations_selections[group_index][selection_type]}`).selected = false;
                document.getElementById(`select-${selection_type}-${group_index}-${selection_id}`).selected = true;
                animations_selections[group_index][selection_type] = selection_id;
                removeGroup(group_index);
                global_counter = global_counter+1;
                group_index==0 ? simpleUpdate(makeNewAccessingString(0),global_counter,animations_filenames[1]) : simpleUpdate(animations_filenames[0],global_counter,makeNewAccessingString(1));
            }
        }
    });
}

function clickSelection(btn){
    btn.addEventListener('click',function(){if (animations_dict[1]!=undefined && current_selection!=+btn.id.slice(-1)) toggleDistributionSelection()});
};

function yearsLinesEventListeners(){
    d3.selectAll(".years-line")
    .on(!has_mouse ? 'touchstart' : 'mouseenter', function(){
        const class_list_name = this.classList;
        is_hovering_years = true;
        if (class_list_name.contains('years-line-clicked')) {
            const selection_index = class_list_name.contains('years-line-0') ? 0 : 1;
            const line_index = this.id.slice(13);
            addYearTooltips(line_index,selection_index);
            animations_dict[selection_index].showTooltip(+line_index,false);
            animations_dict[selection_index].tooltip_percentile = +line_index;
        }
    })
    .on(!has_mouse ? 'touchend' : 'mouseleave', function(){ cancelYearToolTip(this.classList) })
    .on('touchcancel', function(){cancelYearToolTip(this.classList)
    });
    document.querySelectorAll('.year-text').forEach(function(btn) { yearTextListener(btn) });

};

function cancelYearToolTip(class_list_name){
    is_hovering_years = false;
    if (class_list_name.contains('years-line-clicked')) {
        const selection_index = class_list_name.contains('years-line-0') ? 0 : 1;
        removeYearTooltips();
        density_tooltip.style('opacity','0');
        animations_dict[selection_index].tooltip_percentile = undefined;
    }
}

function makeNewAccessingString(group_index){
    return `./processed_data/${animations_selections[group_index]['work_type']}/${animations_selections[group_index]['sex']}/${animations_selections[group_index]['age']}/${animations_selections[group_index]['race']}/data.json`
}


function demographicDropdowns(btn){
    btn.addEventListener('change',function(){
        const this_id = this.id;
        const select_index = +this_id[6];
        if (select_index==0 || second_group_disabled==false){
            const demographic_group = this.value;
            const demographic_type = this_id.slice(8);
            if (animations_selections[select_index][demographic_type] != demographic_group){
                auto_scrolling==true ? stopScrolling() : wrapper_with_adjusted_margins.selectAll("*").interrupt();
                document.getElementById(`radio-${demographic_type}-${select_index}-${animations_selections[select_index][demographic_type]}`).checked = false;
                document.getElementById(`radio-${demographic_type}-${select_index}-${demographic_group}`).checked = true;
                animations_selections[select_index][demographic_type] = demographic_group;
                removeGroup(select_index)
                global_counter = global_counter+1;
                select_index==0 ? simpleUpdate(makeNewAccessingString(0),global_counter,animations_filenames[1]) : simpleUpdate(animations_filenames[0],global_counter,makeNewAccessingString(1));
            }
        }
    })
}

function toggleFullScreen(){ fullscreen ? closeFullscreen(fullscreen_index) : openFullscreen(fullscreen_index)};

function setDensityEnter(){
    if (!has_entered_mouse){
        density_enter_rect
        .attr('y',years_line_height)
        .attr("width",totalWidth)
        .attr('height',totalHeight);
    }
}

function getMargins(){
    if (window.matchMedia('(max-width: 785px), (max-height:515px)').matches) return {top: 40, right: 35, bottom: 60, left: 100,ind:0}; // Small browsers
    if (window.matchMedia('(min-width:1350px)').matches) return {top: 40, right: 40, bottom: 80, left: 130,ind:2}; // Large browsers
    return  {top: 40, right: 40, bottom: 70, left: 115,ind:1};
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
    wrapper_wrapper.attr("width",totalWidth).attr("height",totalHeight+years_line_height);
    wrapper_svg.attr("width",totalWidth).attr("height",totalHeight);
    wrapper_svg.select('#rect-svg').attr("width",totalWidth).attr("height",totalHeight-margins.top).attr("transform","translate(0," + margins.top + ")");
    wrapper_svg.select('#rect-svg2').attr("width",totalWidth-(margins.left)).attr("height",totalHeight-margins.bottom).attr("transform","translate("+margins.left+",0)");
    wrapper_with_adjusted_margins.attr("transform","translate(" + margins.left + "," + margins.top + ")");
    curr_year_line.attr('y1',years_line_height).attr('y2',years_line_height).attr('x2',margins.left-4.5).attr('x1',totalWidth-margins.right);
    years_svg.attr("transform", "translate(" + margins.left + ",0)");
    hover_rect.attr('x',0).attr('y',-1*margins.top).attr('width',modifiedWidth).attr('height',modifiedHeight+margins.top);
    d3.select('#density-enter-inner').style("width",`${totalWidth-(margins.left+margins.right)}px`).style("height",`${totalHeight-margins.bottom}px`).style("transform",`translate(${margins.left}px,0)`);
}

// SETUP -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
let scroll_duration = 32000;
const has_mouse = !(matchMedia('(hover: none)').matches);
let auto_scrolling = false;
let bottom_svg_hover = false;
let current_selection = 0;
let years_line_height = 8; // the width of the svg on top of the density_svg for plotting the current year info
let animations_timeout0,animations_timeout1,copy_timeout, is_changing,toggle_timeout,resize_timeout,is_expanded, animation_timeout, scroll_limit, years_distance, years_lower, wheel_timeout, touchscreen_timeout, num_ages,curveFunction,clipFunction,hover_rect,years_svg_wrapper,num_x_ticks,global_x_max,global_y_max,x_scale,y_scale,global_thresholds,scaled_global_thresholds,global_num_thresholds,global_scroll_num,global_scroll_floor, x_coordinate,scaled_bottom,scaled_top,years_svg,years_x_scale,years_y_scale,line_function;
let animations_dict = [undefined,undefined]
let second_group_disabled = true;
let animations_selections = [{'work_type':'full_time','sex': 'all_sexes','age': 'all_ages','race':'all_races'}, {'work_type':'full_time','sex': 'males', 'age': 'from_30_to_49', 'race':'all_races'}]
let animations_filenames = ['./processed_data/full_time/all_sexes/all_ages/all_races/data.json',undefined];
let shown_distributions = [true,false];
let is_transitioning = false;
let tooltips_margin = 5;
let fullscreen = false;
let has_entered_mouse = false;
let is_hovering_years = false;
let show_group_icon = false;
let icon_group_currently_shown = false;
let has_toolbar = false;
let content_obj = document.documentElement;
let is_small = undefined;
let has_legend = d3.select('#legend').style('display')=='flex';
let showing_loader = false;
const fullscreen_index = getFullScreenIndices();
const density_tooltip = d3.select('#density-tooltip');
let just_resized = false;
const document_body = d3.select('body');
const toolbar_selector =   d3.select('#toolbar');
const plus_wrapper =   d3.select('#plus-wrapper');
const icon_wrapper = d3.select('#icon-wrapper');
const border_hider = d3.select('#border-hider');
let toggle_forward_back = false;
let global_counter=0;
const uncut_tholds = [ 0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000, 36000, 38000, 40000, 42000, 44000, 46000, 48000, 50000, 52000, 54000, 56000, 58000, 60000, 62000, 64000, 66000, 68000, 70000, 72000, 74000, 76000, 78000, 80000, 82000, 84000, 86000, 88000, 90000, 92000, 94000, 96000, 98000, 100000, 102000, 104000, 106000, 108000, 110000, 112000, 114000, 116000, 118000, 120000, 122000, 124000, 126000, 128000, 130000, 132000, 134000, 136000, 138000, 140000, 142000, 144000, 146000, 148000, 150000, 152000, 154000, 156000, 158000, 160000, 162000, 164000, 166000, 168000, 170000, 172000, 174000, 176000, 178000, 180000, 182000, 184000, 186000, 188000, 190000, 192000, 194000, 196000, 198000, 200000, 202000, 204000, 206000, 208000, 210000, 212000, 214000, 216000, 218000, 220000, 222000, 224000, 226000, 228000, 230000, 232000, 234000, 236000, 238000, 240000, 242000, 244000, 246000, 248000, 250000, 252000, 254000, 256000, 258000, 260000, 262000, 264000, 266000, 268000, 270000, 272000, 274000, 276000, 278000, 280000, 282000, 284000, 286000, 288000, 290000, 292000, 294000, 296000, 298000, 300000, 302000, 304000, 306000, 308000, 310000, 312000, 314000, 316000, 318000, 320000, 322000, 324000, 326000, 328000, 330000, 332000, 334000, 336000, 338000, 340000, 342000, 344000, 346000, 348000, 350000, 352000, 354000, 356000, 358000, 360000, 362000, 364000, 366000, 368000, 370000, 372000, 374000, 376000, 378000, 380000, 382000, 384000, 386000, 388000, 390000, 392000, 394000, 396000, 398000, 400000, 402000, 404000, 406000, 408000, 410000, 412000, 414000, 416000, 418000, 420000, 422000, 424000, 426000, 428000, 430000, 432000, 434000, 436000, 438000, 440000, 442000, 444000, 446000, 448000, 450000, 452000, 454000, 456000, 458000, 460000, 462000, 464000, 466000, 468000, 470000, 472000, 474000, 476000, 478000, 480000, 482000, 484000, 486000, 488000, 490000, 492000, 494000, 496000, 498000, 500000, 502000, 504000, 506000, 508000, 510000, 512000, 514000, 516000, 518000, 520000, 522000, 524000, 526000, 528000, 530000, 532000, 534000, 536000, 538000, 540000, 542000, 544000, 546000, 548000, 550000, 552000, 554000, 556000, 558000, 560000, 562000, 564000, 566000, 568000, 570000, 572000, 574000, 576000, 578000, 580000, 582000, 584000, 586000, 588000, 590000, 592000, 594000, 596000, 598000, 600000, 602000, 604000];
const race_scale = d3.scaleOrdinal().domain(['all_races', 'white_non_hispanic','black_non_hispanic','hispanic']).range(['All ','White ','Black ','Hisp. ']);
const sex_scale = d3.scaleOrdinal().domain(['all_sexes', 'males','females']).range(['workers','men','women']);
const age_scale = d3.scaleOrdinal().domain(['all_ages', 'under_30','from_30_to_49','over_50']).range(['',' 16-29 ',' 30-49 ',' 50+']);
const ticks_scale = d3.scaleThreshold().domain([300,700,1350]).range([2,3,5,8]);

const race_id_dict = {
    '1': 'all_races',
    "2": 'white_non_hispanic',
    '3' : 'black_non_hispanic',
    '4' : 'hispanic'}

const sex_id_dict = {
        '1': 'all_sexes',
        "2": 'males',
        '3' : 'females'}

const age_id_dict = {
    '1': 'all_ages',
    "2": 'under_30',
    '3' : 'from_30_to_49',
    '4' : 'over_50'}

const workers_id_dict = {     
    '1': 'full_time',
    "2": 'mine',
    '3' : 'fred'}

let [totalWidth,totalHeight] = getWidthAndHeight();
let margins = getMargins();
let [modifiedWidth,modifiedHeight] = widthAndHeightMinusMargins(margins,totalWidth,totalHeight);

// SVG SELECTORS -- -- -- -- -- -- -- -- 
const wrapper_wrapper = d3.select("#density-div")
    .append("svg")
    .attr("width",totalWidth)
    .attr("height",totalHeight+years_line_height);

const wrapper_svg = wrapper_wrapper
    .append('g')
    .attr('id','wrapper-svg')
    .attr("width",totalWidth)
    .attr("height",totalHeight)
    .attr("transform","translate(0,"+years_line_height+")");

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
        .style('fill','#545454')

const wrapper_with_adjusted_margins = wrapper_svg
    .append("g")
    .attr("transform","translate(" + margins.left + "," + margins.top + ")");

const grid_svg = wrapper_with_adjusted_margins.append('g');
const density_svg_dict = [ wrapper_with_adjusted_margins.append("g"),wrapper_with_adjusted_margins.append("g") ];
const lines_svg_dict = [ wrapper_with_adjusted_margins.append("g"), wrapper_with_adjusted_margins.append("g") ];
const density_outer_group = wrapper_with_adjusted_margins.append("g").attr('class','hidden');
const hover_group = wrapper_with_adjusted_margins.append("g");
const density_enter_g = wrapper_wrapper.append('g');
const density_enter_rect = density_enter_g
    .append("rect")
    .attr("id",'density-enter-rect')
    .attr('y',years_line_height)
    .attr("width",totalWidth)
    .attr('height',totalHeight);

const curr_year_line = density_enter_g
    .append("line")
    .attr('y1',years_line_height)
    .attr('y2',years_line_height)
    .attr('x2',margins.left-4.5)
    .attr('x1',totalWidth-margins.right)
    .attr('class','current-year-line hidden');

d3.select('#density-enter-inner')
    .style("width",`${totalWidth-(margins.left + margins.right)}px`)
    .style("height",`${totalHeight-margins.bottom}px`)
    .style("transform",`translate(${margins.left}px,0)`);

if (isIE()){
    d3.selectAll('.hidden').remove();
    d3.select('#loader-content').remove();
    d3.select('#background-years').remove();
    d3.select('#background-rect').remove();
    d3.select('#density-div').remove();
    d3.select('#ie-issues').style('display','flex');
}else{
    // example ?id0=2222?id1=123?s=500?p0=50?p1=50
    const url = new URL(window.location.href);
    if (url.searchParams.has('id0')){
        const id0 = url.searchParams.get("id0");
        animations_selections[0]['work_type'] = workers_id_dict[id0[0]];
        animations_selections[1]['work_type'] = workers_id_dict[id0[0]];
        if (animations_selections[0]['work_type'] != 'full_time'){
            document.getElementById('selector-full_time').selected = false;
            document.getElementById(`selector-${animations_selections[0]['work_type']}`).selected = true;
        }
        let percentile_vec0 = [];
        if (url.searchParams.has('p0')){
            const p0 = url.searchParams.get('p0');
            if (p0.length % 2 === 0) for (let i=0;i<=p0.length-1;i=i+2) percentile_vec0.push(+p0.slice(i,i+2));
        }
        const scroll_amount = (url.searchParams.has('s')) ? (+url.searchParams.get('s')/1000) : 0;
        updateGroupOnSetup(id0.slice(1),0)
        if (url.searchParams.has('id1')){
            const id1 = url.searchParams.get("id1");
            updateGroupOnSetup(id1,1)
            document.querySelector('input[type="checkbox"]').checked = true;
            checkBoxChanger(false)
            document.getElementById('group0highlight').disabled=false;
            document.getElementById('group1highlight').disabled=false;
            let percentile_vec1 = [];
            if (url.searchParams.has('p1')){
                const p1 = url.searchParams.get('p1');
                if (p1.length % 2 === 0) for (let i=0;i<=p1.length-1;i=i+2) percentile_vec1.push(+p1.slice(i,i+2))
            }
            initialSetup(animations_filenames[0],animations_filenames[1],scroll_amount,percentile_vec0,percentile_vec1,true);
        } else{
            initialSetup(animations_filenames[0],undefined,scroll_amount,percentile_vec0,[],true);
        }
    } else{
        initialSetup(animations_filenames[0])
    }
}
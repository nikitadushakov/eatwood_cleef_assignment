let plot_sizes = document.querySelector('.plot_wrapper').getBoundingClientRect();
let plot_heght = plot_sizes.height;
let plot_width = plot_sizes.width;

const get_bar_plot = (x, y) => {
  var bar_data = [{
    type: "bar",
    x: x,
    y: y,
    marker: {
      color: "#625ED7",
      line: {
        width: 0
      }
    }
  }];
  return bar_data
}


const get_pie_plot = (labels, values) => {
    var pie_data = [{
      values: values,
      labels: labels,
      type: 'pie'

  }]
  return pie_data
}


const get_hist_plot = (x) => {
    var pie_data = [{
      x: x,
      type: 'box',
      opacity: 0.7

  }]
  return pie_data
}



const get_layout = (width) => {
  var layout = {
    // autosize: true,
    width: width,
    height: plot_heght,
    margin: {
      l: 20,
      r: 20,
      b: 15,
      t:15,
      pad: 40
    },
    font: {
      size: 10,
      color: "#474862",
      family: "Montserrat",
      weight: 500
    },
    plot_bgcolor: "rgba(0,0,0,0)",
    paper_bgcolor: "rgba(0,0,0,0)",
    yaxis: {
      gridcolor: "#E5E7ED"
    },
  
  };
  return layout


}


var config = { responsive: true };



const left = document.querySelector('.left');
const dates_wrapper = document.querySelector('.dates');
const select_payer = (e) => {
    // console.log(e);
  let old = document.querySelector('.left .selected');
  old.classList.remove('selected');
  let target = e.target;
  target.classList.add('selected');
  let date = document.querySelector('.dates .selected');

  document.querySelector('.header h1').innerText = `${target.innerText} statistics`
  plots(target.innerText, date.innerText);
};

const show_date_wrapper = () => {
  let date_wrapper = document.querySelector('.dates');
  date_wrapper.style.opacity = 1;
  date_wrapper.style.transform = 'scale(1)';
}

const hide_date_wrapper = () => {
  let date_wrapper = document.querySelector('.dates');
  date_wrapper.style.opacity = 0;
  date_wrapper.style.transform = 'scale(0.2)';
}

document.querySelector('.date').addEventListener('click', show_date_wrapper);
// document.body.addEventListener('click', hide_date_wrapper);


const select_date = (e) => {
//   console.log(e);
  let old = document.querySelector('.dates .selected');
  old.classList.remove('selected');
  let target = e.target;
  target.classList.add('selected');
  let payer = document.querySelector('.left .selected');
  document.querySelector('.date').innerText = `Selected date : ${target.innerText}`;
  hide_date_wrapper();
  plots(payer.innerText, target.innerText);
};

async function start() {
  let response = await fetch(`${window.origin}/get_payers`);
  let payers = await response.json();
  let c = 0;
  let payer;
  let date;

  payers['result'].forEach(element => {
    let span = document.createElement('span');
    if (c === 0) {
      payer = element;
      span.classList.add('selected');
      c = 1;
    }
    span.innerText = element;
    span.addEventListener('click', select_payer)
    left.appendChild(span);
  });
  c = 0;
  let date_response = await fetch(`${window.origin}/get_dates`);
  let dates = await date_response.json();
  dates['result'].forEach(element => {
    let span = document.createElement('span');
    if (c === 0) {
      date = element; 
      span.classList.add('selected');
      c = 1;
    }
    span.innerText = element;
    span.addEventListener('click', select_date)
    dates_wrapper.appendChild(span);
  });
  plots(payer, date);

}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function plots(payer, year_month) {
  let response_claims = await fetch(`${window.origin}/get_top_claims?payer=${payer}&year_month=${year_month}`);
  let claims_json = await response_claims.json();
  let claims_plot_data = get_pie_plot(claims_json['x'], claims_json['y']);

  let response_service = await fetch(`${window.origin}/get_top_service_category?payer=${payer}&year_month=${year_month}`);
  let service_json = await response_service.json();
  let service_plot_data = get_pie_plot(service_json['x'], service_json['y']);

  let response_total = await fetch(`${window.origin}/get_total?payer=${payer}&year_month=${year_month}`);
  let total_json = await response_total.json();
  let total_plot_data = get_hist_plot(total_json['x']);






  let g1 = document.querySelector('#myDiv');
  let g2 = document.querySelector('#myDiv2');
  let g3 = document.querySelector('#myDiv3');

  g1.style.opacity = 0;
  g1.style.transform = "scale(0.7)";

  g2.style.opacity = 0;
  g2.style.transform = "scale(0.7)";
  let hist_plot_width = document.querySelector('#myDiv3').getBoundingClientRect().width;
  g3.style.opacity = 0;
  g3.style.transform = "scale(0.7)";
  await sleep(200);

  let layout = {
    // autosize: true,
    width: hist_plot_width,
    height: plot_heght,
    margin: {
      // l: 30,
      // r: 30,
      b: 30,
      t:30
      // pad: 130
    },
    font: {
      size: 14,
      color: "#474862",
      family: "Montserrat",
      weight: 500
    },
    yaxis: {
      gridcolor: "#E5E7ED"
    },
  
  };

  Plotly.newPlot("myDiv", claims_plot_data, get_layout(plot_width), config);
  Plotly.newPlot("myDiv2", service_plot_data, get_layout(plot_width), config);
  Plotly.newPlot("myDiv3", total_plot_data, layout=layout);
  g1.style.opacity = 1;
  g2.style.opacity = 1;
  g3.style.opacity = 1;

  g1.style.transform = "scale(1)";
  g2.style.transform = "scale(1)";
  g3.style.transform = "scale(1)";
  

}
start();


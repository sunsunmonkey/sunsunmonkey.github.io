const myChart = echarts.init(document.getElementById('chart'));
const  option = {
    animation: false,
    legend: {
      show:false
    },
    grid: {
        left: '5%',    // 左边距
        right: '5%',   // 右边距
        top: '5%',     // 上边距
        bottom: 0   // 下边距
      },
    xAxis: {
      type: 'category',
      show:false,
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      show:false,
      type: 'value',
      axisLabel: {
        formatter: '{value} °C'
      }
    },
    series: [
      {
        name: 'Highest',
        type: 'line',
        smooth: true,
        symbol: 'circle', // 数据点的形状
        symbolSize: 7,
        data: [35, 35, 31, 31, 32, 33, 33],
        itemStyle: {
          color: 'orange'
        },
        label: {
          show: true, 
          formatter: '{c}°',
          fontSize: 15 
        }
      },
      {
        name: 'Lowest',
        type: 'line',
        smooth: true,
        symbol: 'circle', 
        symbolSize: 7,
        data: [25,26,27,25,25,26,26],
        label: {
          show: true, 
          formatter: '{c}°',
          fontSize: 15 
        },  
        itemStyle: {
          color: 'skyBlue'
        }
      }
    ]
  };
          
myChart.setOption(option);
window.addEventListener('resize', function() {
myChart.resize();
});
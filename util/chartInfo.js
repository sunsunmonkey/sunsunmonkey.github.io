
export const  option = {
    animation: false,
    legend: {
      show:false
    },
    grid: {
        left: '5%',    
        right: '5%',  
        top: '5%',     
        bottom: 0   
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
        symbol: 'circle', 
        symbolSize: 7,
        data: [],
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
        data: [],
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
          

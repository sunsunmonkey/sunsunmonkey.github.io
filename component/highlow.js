import { getSevenDay } from "../service/getSevenDay.js"
import {dataFormatWeek,dataFormatDay} from "../util/handledata.js"
import {textToImg} from "../util/textToImg.js"

class HighLowItemTop extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#highlow-item-top").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    connectedCallback (){
        const week = this.shadowRoot.querySelector(".week");
        const day = this.shadowRoot.querySelector(".day");
        const weather_desc = this.shadowRoot.querySelector(".weather_desc");
        const  img = this.shadowRoot.querySelector(".icon img");
        const {fxDate,textDay}= this.data
        week.textContent = dataFormatWeek(fxDate);
        day.textContent = dataFormatDay(fxDate);
        let text = textDay
        if(text.includes("雨") ){
            text ="雨" 
        }
        if(text.includes("云") ){
            text ="多云" 
        }
        weather_desc.textContent =  text;
        img.src = textToImg.day[text]
    }
}

customElements.define('highlow-item-top', HighLowItemTop);


class HighLowItemBottom extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#highlow-item-bottom").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    connectedCallback (){
        const wind = this.shadowRoot.querySelector(".wind");
        const windScale = this.shadowRoot.querySelector(".wind-scale");
        const weather_desc = this.shadowRoot.querySelector(".weather_desc");
        const  img = this.shadowRoot.querySelector(".icon img");
        const {windDirDay,textNight} =this.data;
        const windScaleDay = this.data.windScaleDay.slice(0,1);
        wind.textContent = windDirDay;
        windScale.textContent = windScaleDay+"级";
        weather_desc.textContent = textNight;
        let text = textNight
        if(text.includes("雨") ){
            text ="雨" 
        }
        if(text.includes("云") ){
            text ="多云" 
        }
        weather_desc.textContent =  text;
        img.src = textToImg.night[text]
    }
}

customElements.define('highlow-item-bottom', HighLowItemBottom);

class HighLowList extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#highlow").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
   async connectedCallback (){
    const res = await getSevenDay(localStorage.getItem("Id"))
    const topData =[];
    const bottomData = [];
    const chartMaxData = [];
    const chartMinData = [];
    res.daily.map((item)=>{
        const {fxDate,tempMax,
            tempMin,textDay,
            textNight,windScaleDay
            ,windDirDay
        } = item;
        topData.push({fxDate,textDay})
        bottomData.push({windDirDay,windScaleDay,textNight})
        chartMaxData.push(tempMax)
        chartMinData.push(tempMin)
    })
    this.createchart(chartMaxData,chartMinData)
    topData.map(item=>{
        const topList =  this.shadowRoot.querySelector(".top-list");
        const highlowItemTop = document.createElement("highlow-item-top");

        highlowItemTop.data = item 
        topList.append(highlowItemTop)
    })
    bottomData.map(item=>{
        const BottomList = this.shadowRoot.querySelector(".bottom-list");
        const highLowItemBottom = document.createElement("highlow-item-bottom");

        highLowItemBottom.data = item 
        BottomList.append(highLowItemBottom) 
   })
   }
    createchart(chartMaxData,chartMinData){
        const myChart = echarts.init(this.shadowRoot.getElementById('chart'));
        const  option = {
            animation: false,
            legend: {
              show:false
            },
            grid: {
                left: '5%',    
                right: '5%',  
                top: '10%',     
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
                data: chartMaxData,
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
                data: chartMinData,
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
    }
}

customElements.define('my-highlow', HighLowList);
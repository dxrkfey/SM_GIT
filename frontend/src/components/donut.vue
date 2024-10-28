<template>
    <chart class="container" :options="gaugeOptions" :updateArgs="[true, true]"/>
  </template>
<script>
import { reactive, watch, toRefs } from 'vue'
import { Chart } from 'highcharts-vue'
export default {
  name: 'C-Chart-Donut',
  components: {
    Chart
  },
  props: {
    dataSource: {},
    color: {
      default: () => ({ background: '#D1E7DD', font: '#198754' }),
      type: Object,
      required: false
    }
  },
  setup (props) {
    const gaugeOptions = reactive({
      chart: {
        type: 'pie',
        spacingTop: props.dataSource.spacingTop ? props.dataSource.spacingTop : 0,
        spacingBottom: props.dataSource.spacingBottom ? props.dataSource.spacingBottom : 0,
        marginTop: props.dataSource.marginTop ? props.dataSource.marginTop : 20,
        reflow: true, // Ensures chart resizes with the container
        // width: 1200,
        backgroundColor: null // Makes the background transparent
      },
      title: {
        text: '',
        align: 'left',
        style: {
          fontSize: '12px' // Set the font size here
        }
      },
      accessibility: {
        announceNewData: {
          enabled: true
        },
        point: {
          valueSuffix: '%'
        }
      },
      legend: {
        enabled: true,
        itemStyle: {
          fontSize: '10px' // Adjust the font size as needed
        },
        labelFormatter: function () {
          return '<span style="font-weight: bold;">' + this.name + ':</span> ' + this.y
        }
        // align: 'right',
        // verticalAlign: 'middle', // Adjust vertical alignment as needed
        // layout: 'vertical' // Adjust layout as needed
        // itemMarginTop: 5, // Adjust margin between legend items as needed
        // itemMarginBottom: 5 // Adjust margin between legend items as needed
      },
      tooltip: {
        // headerFormat: '<span style="font-size:18px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0; font-size: 16px"><b>{point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          size: '60',
          dataLabels: {
            enabled: true,
            distance: 20
          },
          showInLegend: true
        },
        series: {
          borderRadius: 5,
          dataLabels: [
            {
              enabled: false,
              distance: 5,
              format: '{point.name}',
              style: {
                fontSize: '12px'
              }
            },
            {
              enabled: true,
              distance: '-50%',
              filter: {
                property: 'percentage',
                operator: '>',
                value: 5
              },
              format: '{point.y:.1f}',
              style: {
                fontSize: '10px',
                textOutline: 'none'
              }
            }
          ]
        }
      },
      series: [{
        name: 'Donut',
        // color: props.color.background,
        data: [], // Replace with your actual data
        dataLabels: {
          enabled: true,
          style: {
            textOutline: 'none', // This adds a 1px stroke to the text. 'contrast' is a Highcharts keyword that applies a high-contrast outline.
            fontSize: '12px', // Set the font size
            fontWeight: '700', // Set the font weight
            color: props.color.font // Set the color
            // Add more styles as needed
          }
        }
      }],
      credits: {
        enabled: true
      }
    })

    const { dataSource } = toRefs(props)

    // Ensure dataSource is reactive
    watch(dataSource, (newVal, oldVal) => {
      // console.log('dataSource updated:', newVal)
    // Handle dataSource update
    })
    const dataMaster = dataSource.value
    if (dataMaster.data.length > 0) {
      gaugeOptions.series[0].data = dataMaster.data
      gaugeOptions.series[0].name = dataMaster.unit
      // gaugeOptions.title.text = dataMaster?.title ? dataMaster.title : ''
      gaugeOptions.title.text = dataMaster?.title ? dataMaster.title : ""
      gaugeOptions.title.align = dataMaster?.titleAlign ? dataMaster.titleAlign : 'center'
      gaugeOptions.title.style.fontSize = dataMaster?.titleSize ? dataMaster.titleSize : '12px'
      gaugeOptions.plotOptions.pie.size = dataMaster.chartSize
      if (dataMaster && dataMaster.credits !== undefined) {
        gaugeOptions.credits.enabled = dataMaster.credits
      } else {
        gaugeOptions.credits.enabled = true // Default to true if dataMaster.credits is not provided or undefined
      }
    }
    watch(
      () => props.dataSource,
      (newVolume) => {
        gaugeOptions.series[0].data = newVolume.data
        // const series = gaugeOptions.series[0]
        // series.data = []
        // setTimeout(() => {
        //   newVolume.data.forEach(element => {
        //     series.data.push(element)
        //   })
        // }, 300)
      },
      { deep: true }
    )
    return {
      gaugeOptions
    }
  }
}
</script>
<style>
.container{
  width: 100%;
  height: 100%;
}
</style>
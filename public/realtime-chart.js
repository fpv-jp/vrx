// This is a refactored version of the following site:
// https://bost.ocks.org/mike/path/

class Chart {
  constructor(id, config, xDomain) {
    const { dataPointCount, duration, margin, width, height, yAxisTicks, showGridX, showGridY } = config

    this.id = id
    this.data = d3.range(dataPointCount).map(() => 0)
    this.xDomain = xDomain
    this.lastIndex = xDomain[1]

    this.dataPointCount = dataPointCount
    this.duration = duration
    this.margin = margin
    this.width = width - margin.right
    this.height = height - margin.top - margin.bottom
    this.showGridX = showGridX
    this.showGridY = showGridY
    this.yAxisTicks = yAxisTicks

    this.initialize()
  }

  initialize() {
    const { duration, lastIndex, width, height, margin, data, xDomain, yAxisTicks } = this
    const now = new Date(Date.now() - duration)

    this.timeScale = d3.time
      .scale()
      .domain([now - lastIndex * duration, now - duration])
      .range([0, width])

    this.xScale = d3.scale.linear().domain(xDomain).range([0, width])

    this.yScale = d3.scale
      .linear()
      .domain([d3.min(data), d3.max(data)])
      .range([height, 0])

    this.chartGroup = d3
      .select(this.id)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    this.chartGroup
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height)

    const yAxis = d3.svg.axis().scale(this.yScale).ticks(yAxisTicks).orient('left')
    this.yScale.axis = yAxis
    this.yAxisGroup = this.chartGroup
      .append('g')
      .attr('class', 'chart-axis chart-axis-y')
      .call(yAxis)

    const xAxis = d3.svg.axis().scale(this.timeScale).orient('bottom')
    this.timeScale.axis = xAxis
    this.xAxisGroup = this.chartGroup
      .append('g')
      .attr('class', 'chart-axis chart-axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)

    this.transition = d3.select({}).transition().duration(duration).ease('linear')
  }

  updateAxis() {
    const { timeScale, yScale, xAxisGroup, yAxisGroup, data, duration, lastIndex, showGridX, showGridY, width, height } = this

    const now = new Date()
    timeScale.domain([now - lastIndex * duration, now - duration])
    xAxisGroup.call(timeScale.axis)

    yScale.domain([d3.min(data), d3.max(data)])
    yAxisGroup.call(yScale.axis)

    if (showGridX) {
      const xTicks = xAxisGroup.selectAll('g.tick')
      xTicks.each(function () {
        const tick = d3.select(this)
        tick.selectAll('.chart-grid-x').remove()
        tick.append('line').attr('class', 'chart-grid-x').attr('y1', 0).attr('y2', -height)
      })
    }

    if (showGridY) {
      const yTicks = yAxisGroup.selectAll('g.tick')
      yTicks.each(function () {
        const tick = d3.select(this)
        tick.selectAll('.chart-grid-y').remove()
        tick.append('line').attr('class', 'chart-grid-y').attr('x1', 0).attr('x2', width)
      })
    }
  }

  resize(width, height) {
    const { margin, xScale, yScale, timeScale, xAxisGroup, yAxisGroup, id, rightLabel } = this

    this.width = width - margin.left - margin.right
    this.height = height - margin.top - margin.bottom

    const newWidth = this.width
    const newHeight = this.height

    xScale.range([0, newWidth])
    yScale.range([newHeight, 0])
    timeScale.range([0, newWidth])

    d3.select(id)
      .select('svg')
      .attr('width', width)
      .attr('height', height)

    d3.select(id)
      .select('clipPath rect')
      .attr('width', Math.abs(newWidth))
      .attr('height', Math.abs(newHeight))

    if (rightLabel) {
      rightLabel.attr('x', newWidth - 3)
    }

    xAxisGroup.attr('transform', `translate(0,${newHeight})`)
    xAxisGroup.call(timeScale.axis)
    yAxisGroup.call(yScale.axis)
  }
}

// LineChart
// --------------------------------------------------------------------------------------------
class LineChart extends Chart {
  constructor(id, getDataPoint, config, interpolation = 'linear') {
    const xDomain = interpolation === 'linear'
      ? [0, config.dataPointCount - 1]
      : [1, config.dataPointCount - 2]
    super(id, config, xDomain)
    this.getDataPoint = getDataPoint
    this.interpolation = interpolation
    this.render()
  }

  render() {
    const { interpolation, xScale, yScale, chartGroup, data } = this

    this.lineGenerator = d3.svg
      .line()
      .interpolate(interpolation)
      .x((d, i) => xScale(i))
      .y((d) => yScale(d))

    this.linePath = chartGroup
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(data)
      .attr('class', 'chart-line')
      .attr('d', this.lineGenerator)

    this.tick()
  }

  tick() {
    const updateChart = () => {
      const { getDataPoint, data, lineGenerator, linePath, xScale, interpolation } = this

      if (!getDataPoint) return

      data.push(getDataPoint())
      this.updateAxis()

      const translateX = interpolation === 'linear' ? xScale(-1) : xScale(0)
      linePath
        .attr('d', lineGenerator)
        .attr('transform', null)
        .transition()
        .attr('transform', `translate(${translateX})`)

      data.shift()
    }

    this.transition = this.transition
      .each(updateChart)
      .transition()
      .each('start', () => this.tick())
  }

  stop() {
    this.getDataPoint = null
  }
}

// BarChart
// --------------------------------------------------------------------------------------------
class BarChart extends Chart {
  constructor(id, getDataPoint, config) {
    super(id, config, [0, config.dataPointCount - 1])
    this.getDataPoint = getDataPoint
    this.render()
  }

  render() {
    const { chartGroup, data, xScale, yScale, width, dataPointCount, height } = this

    const barWidth = width / dataPointCount - 1

    this.barElements = chartGroup
      .append('g')
      .attr('class', 'chart-bars')
      .attr('clip-path', 'url(#clip)')
      .selectAll('.chart-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'chart-bar')
      .attr('x', (d, i) => xScale(i))
      .attr('y', (d) => yScale(d))
      .attr('width', barWidth)
      .attr('height', (d) => height - yScale(d))

    this.tick()
  }

  tick() {
    const updateChart = () => {
      const { getDataPoint, data, xScale, yScale, width, dataPointCount, height, duration } = this

      if (!getDataPoint) return

      data.push(getDataPoint())
      this.updateAxis()

      const [domainStart, domainEnd] = xScale.domain()
      xScale.domain([domainStart + 1, domainEnd + 1])

      const barWidth = width / dataPointCount - 1

      this.barElements = this.barElements.data(data)
      this.barElements
        .enter()
        .append('rect')
        .attr('class', 'chart-bar')
        .attr('x', (d, i) => xScale(i))
        .attr('y', (d) => yScale(d))
        .attr('width', barWidth)
        .attr('height', (d) => height - yScale(d))

      this.barElements
        .transition()
        .duration(duration)
        .attr('x', (d, i) => xScale(i))
    }

    this.transition = this.transition
      .each(updateChart)
      .transition()
      .each('start', () => this.tick())
  }

  stop() {
    this.getDataPoint = null
  }
}

// AreaChart
// --------------------------------------------------------------------------------------------
class AreaChart extends Chart {
  constructor(id, getDataPoint, config, interpolation = 'linear') {
    super(id, config, [0, config.dataPointCount - 1])
    this.getDataPoint = getDataPoint
    this.interpolation = interpolation
    this.render()
  }

  render() {
    const { interpolation, xScale, yScale, chartGroup, data, width } = this

    this.areaGenerator = d3.svg
      .area()
      .interpolate(interpolation)
      .x((d, i) => xScale(i))
      .y0(yScale(0))
      .y1((d) => yScale(d))

    this.areaPath = chartGroup
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(data)
      .attr('class', 'chart-area')
      .attr('d', this.areaGenerator)

    this.leftLabel = chartGroup
      .append('text')
      .attr('x', 0)
      .attr('y', -7)
      .attr('class', 'chart-label chart-label-left')

    this.rightLabel = chartGroup
      .append('text')
      .attr('x', width - 3)
      .attr('y', -7)
      .attr('class', 'chart-label chart-label-right')

    this.tick()
  }

  tick() {
    const updateChart = () => {
      const { getDataPoint, data, areaGenerator, areaPath, xScale, leftLabel, rightLabel } = this

      if (!getDataPoint) return

      const currentData = getDataPoint()
      data.push(currentData.value)

      if (currentData.leftText) leftLabel.text(currentData.leftText)
      if (currentData.rightText) rightLabel.text(currentData.rightText)

      this.updateAxis()

      const translateX = xScale(-1)
      areaPath
        .attr('d', areaGenerator)
        .attr('transform', null)
        .transition()
        .attr('transform', `translate(${translateX})`)

      data.shift()
    }

    this.transition = this.transition
      .each(updateChart)
      .transition()
      .each('start', () => this.tick())
  }

  stop() {
    this.getDataPoint = null
  }
}

window.RealtimeCharts = { LineChart, BarChart, AreaChart }

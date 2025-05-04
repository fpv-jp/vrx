class Chart {
  constructor(id, config, xDomain) {
    let { n, duration, margin, width, height, ticks, gridx, gridy } = config

    this.id = id
    this.data = d3.range(n).map(() => 0)
    this.xDomain = xDomain
    this.lastIndex = xDomain[1]

    this.n = n
    this.duration = duration
    this.margin = margin
    this.width = width - margin.right
    this.height = height - margin.top - margin.bottom
    this.gridx = gridx
    this.gridy = gridy
    this.ticks = ticks

    this.initialize()
  }

  initialize() {
    const now = new Date(Date.now() - this.duration)

    this.timeseries = d3.time
      .scale()
      .domain([now - this.lastIndex * this.duration, now - this.duration])
      .range([0, this.width])

    this.x = d3.scale.linear().domain(this.xDomain).range([0, this.width])

    this.y = d3.scale
      .linear()
      .domain([d3.min(this.data), d3.max(this.data)])
      .range([this.height, 0])

    this.rootElement = d3
      .select(this.id)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')

    this.rootElement //
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)

    this.axisY = this.rootElement
      .append('g')
      .attr('class', 'y axis')
      .call((this.y.axis = d3.svg.axis().scale(this.y).ticks(this.ticks).orient('left')))

    this.axisX = this.rootElement
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call((this.timeseries.axis = d3.svg.axis().scale(this.timeseries).orient('bottom')))

    this.transition = d3.select({}).transition().duration(this.duration).ease('linear')
  }

  updateAxis() {
    const now = new Date()
    this.timeseries.domain([now - this.lastIndex * this.duration, now - this.duration])
    this.axisX.call(this.timeseries.axis)

    this.y.domain([d3.min(this.data), d3.max(this.data)])
    this.axisY.call(this.y.axis)

    if (this.gridx) {
      const xTicks = this.axisX.selectAll('g.tick')
      const height = this.height
      xTicks.each(function () {
        const tick = d3.select(this)
        tick.selectAll('.grid-x').remove()
        tick.append('line').attr('class', 'grid-x').attr('y1', 0).attr('y2', -height)
      })
    }

    if (this.gridy) {
      const yTicks = this.axisY.selectAll('g.tick')
      const width = this.width
      yTicks.each(function () {
        const tick = d3.select(this)
        tick.selectAll('.grid-y').remove()
        tick.append('line').attr('class', 'grid-y').attr('x1', 0).attr('x2', width)
      })
    }
  }

  resize(width, height) {
    this.width = width - this.margin.left - this.margin.right
    this.height = height - this.margin.top - this.margin.bottom

    this.x.range([0, this.width])
    this.y.range([this.height, 0])
    this.timeseries.range([0, this.width])

    d3.select(this.id) //
      .select('svg')
      .attr('width', width)
      .attr('height', height)

    d3.select(this.id) //
      .select('clipPath rect')
      .attr('width', Math.abs(this.width))
      .attr('height', Math.abs(this.height))

    if (this.rightLabel) {
      this.rightLabel.attr('x', this.width - 3)
    }

    this.axisX.attr('transform', `translate(0,${this.height})`)
    this.axisX.call(this.timeseries.axis)
    this.axisY.call(this.y.axis)
  }
}

// LineChart
// --------------------------------------------------------------------------------------------
class LineChart extends Chart {
  constructor(id, getCurrent, config, interpolation = 'linear') {
    super(id, config, interpolation === 'linear' ? [0, config.n - 1] : [1, config.n - 2])
    this.getCurrent = getCurrent
    this.interpolation = interpolation
    this.render()
  }

  render() {
    this.line = d3.svg
      .line()
      .interpolate(this.interpolation)
      .x((d, i) => this.x(i))
      .y((d) => this.y(d))
    this.path = this.rootElement //
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.line)
    this.tick()
  }

  tick() {
    const each = () => {
      if (!this.getCurrent) return
      this.data.push(this.getCurrent())
      this.updateAxis()
      const translate = this.interpolation === 'linear' ? this.x(-1) : this.x(0)
      this.path //
        .attr('d', this.line)
        .attr('transform', null)
        .transition()
        .attr('transform', `translate(${translate})`)
      this.data.shift()
    }
    this.transition = this.transition
      .each(each)
      .transition()
      .each('start', () => this.tick())
  }

  stop() {
    this.getCurrent = null
  }
}

// BarChart
// --------------------------------------------------------------------------------------------
class BarChart extends Chart {
  constructor(id, getCurrent, config) {
    super(id, config, [0, config.n - 1])
    this.getCurrent = getCurrent
    this.render()
  }

  render() {
    this.bars = this.rootElement
      .append('g')
      .attr('class', 'bars')
      .attr('clip-path', 'url(#clip)')
      .selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => this.x(i))
      .attr('y', (d) => this.y(d))
      .attr('width', this.width / this.n - 1)
      .attr('height', (d) => this.height - this.y(d))
    this.tick()
  }

  tick() {
    const each = () => {
      if (!this.getCurrent) return
      this.data.push(this.getCurrent())
      this.updateAxis()
      this.x.domain([this.x.domain()[0] + 1, this.x.domain()[1] + 1])
      this.bars = this.bars.data(this.data)
      this.bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d, i) => this.x(i))
        .attr('y', (d) => this.y(d))
        .attr('width', this.width / this.n - 1)
        .attr('height', (d) => this.height - this.y(d))
      this.bars
        .transition()
        .duration(this.duration)
        .attr('x', (d, i) => this.x(i))
    }
    this.transition = this.transition
      .each(each)
      .transition()
      .each('start', () => this.tick())
  }

  stop() {
    this.getCurrent = null
  }
}

// AreaChart
// --------------------------------------------------------------------------------------------
class AreaChart extends Chart {
  constructor(id, getCurrent, config, interpolation = 'linear') {
    super(id, config, [0, config.n - 1])
    this.getCurrent = getCurrent
    this.interpolation = interpolation
    this.render()
  }

  render() {
    this.area = d3.svg
      .area()
      .interpolate(this.interpolation)
      .x((d, i) => this.x(i))
      .y0(this.y(0))
      .y1((d) => this.y(d))
    this.path = this.rootElement //
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(this.data)
      .attr('class', 'area')
      .attr('d', this.area)
    this.leftLabel = this.rootElement //
      .append('text')
      .attr('x', 0)
      .attr('y', -7)
      .attr('class', 'chart-label left-label')
    this.rightLabel = this.rootElement
      .append('text')
      .attr('x', this.width - 3)
      .attr('y', -7)
      .attr('class', 'chart-label right-label')
    this.tick()
  }

  tick() {
    const each = () => {
      if (!this.getCurrent) return
      const currentValue = this.getCurrent()
      this.data.push(currentValue.value)
      if (currentValue.leftText) this.leftLabel.text(currentValue.leftText)
      if (currentValue.rightText) this.rightLabel.text(currentValue.rightText)
      this.updateAxis()
      const translate = this.x(-1)
      this.path //
        .attr('d', this.area)
        .attr('transform', null)
        .transition()
        .attr('transform', `translate(${translate})`)
      this.data.shift()
    }
    this.transition = this.transition
      .each(each)
      .transition()
      .each('start', () => this.tick())
  }

  stop() {
    this.getCurrent = null
  }
}

export default {
  LineChart,
  BarChart,
  AreaChart,
}

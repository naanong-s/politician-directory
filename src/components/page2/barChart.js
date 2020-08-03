import React, { useRef, useEffect } from "react"

import * as d3 from "d3"

const cssHightChart = {
  height: "300px",
  overflowY: "scroll",
}

function DrawChart({
  data,
  types,
  w,
  is_yAxis,
  color_bars,
  is_starter_bars,
  height_svg,
  is_On,
  is_all,
  search_id,
}) {
  const ref = useRef()
  const margin = { top: 0, right: 50, bottom: 0, left: 100 },
    height = is_On ? 300 : height_svg,
    width = w - margin.right - margin.left

  useEffect(() => {
    const chart = d3
      .select(ref.current)
      .attr("className", "chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
  }, [])
  // sort
  useEffect(() => {
    if (is_starter_bars) {
      d3.selectAll("g").remove()
    }
    draw_bar()
  }, [data])

  useEffect(() => {
    if (is_starter_bars) {
      d3.selectAll("g").remove()
    }
    if (is_all) {
      d3.selectAll("g").remove()
      if (is_On) {
        d3.select(".chart").style("overflow-y", "hidden")
      } else {
        d3.select(".chart").style("overflow-y", "scroll")
      }
      d3.select("svg").attr("height", height)
    } else {
      if (is_On) {
        d3.selectAll(".chart").attr("height", height)
      } else {
        d3.selectAll(".chart")
          .attr("height", height)
          .style("overflow-y", "visible")
      }
      d3.selectAll("svg").attr("height", height)
    }
    draw_bar()
  }, [is_On])

  function draw_bar() {
    const chart = d3.select(ref.current)
    let series = d3.stack().keys(types.slice(1))(data)

    const color = d3
      .scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(color_bars)
      .unknown("#ccc")

    let ids = data.map(d => d.id)
    let y = d3
      .scaleBand()
      .domain(ids)
      .range([0, height])
      .padding(0.2)

    let x = d3
      .scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([0, search_id ? width - 300 : width])

    let vote_dates = data.map(d => d.vote_date)
    let yAxis_vote_dates = d3
      .scaleBand()
      .domain(vote_dates)
      .range([0, height])
      .padding(0.2)

    console.log(vote_dates, "vote_dates")
    var yAxis = g =>
      g
        .attr("className", "yAxis")
        .call(d3.axisLeft(yAxis_vote_dates).ticks(null, "s"))
        .attr("transform", `translate(${0}, ${0})`)
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll("line").remove())

    const g = chart
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("className", "charts")

    const tiny = chart
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("className", "charts")

    const rects = g
      .selectAll("g")
      .data(series)
      .enter()
      .append("g")
      .attr("fill", d => color(d.key))

    const tiny_rects = tiny
      .selectAll("g")
      .data(series)
      .enter()
      .append("g")
      .attr("fill", d => color(d.key))

    const mouseover = d => {
      d3.selectAll(".rect" + d.data.id).style("stroke", "black")
    }
    const mouseout = d => {
      d3.selectAll(".rect" + d.data.id).style("stroke", "none")
    }
    const onClick = d => {
      d3.selectAll(".rect" + d.data.id).style("stroke", "black")
    }
    rects
      .selectAll("rect")
      .data(d => d)
      .join(enter =>
        enter
          .append("rect")
          .attr("x", d => x(d[0]))
          .attr("y", d => y(d.data.id))
          .attr("width", d =>
            search_id ? width - x(d[0]) - 300 : width - x(d[0])
          )
          .attr("height", y.bandwidth())
          .attr("class", d => "rect" + d.data.id)
          .on("mouseover", is_all ? mouseover : "")
          .on("mouseout", is_all ? mouseout : "")
          .on("click", is_all ? onClick : "")
          .attr("transform", `translate(${search_id ? 300 : 0}, 0)`)
      )

    if (search_id) {
      tiny_rects
        .selectAll("rect")
        .data(d => d)
        .join(enter =>
          enter
            .append("rect")
            .attr("y", d => y(d.data.id))
            .attr("width", d => (1 / 250) * width)
            .attr("height", y.bandwidth())
            .attr("className", d => "rect" + d.data.id)
            .on("mouseover", is_all ? mouseover : "")
            .on("mouseout", is_all ? mouseout : "")
            .on("click", is_all ? onClick : "")
            .attr("transform", `translate(${search_id ? 150 : 0}, 0)`)
        )
    }
    console.log(y.bandwidth(), "y")
    console.log(y.range(), "y.range")
    console.log(height, "height")
    console.log(data.length, "length")

    if (is_yAxis) {
      if (!is_On) {
        g.append("g").call(yAxis)
      }
      if (is_On) {
        g.append("text")
          .attr("x", -30)
          .attr("y", 15)
          .style("font-size", "8px")
          .text(data[0].id)
        g.append("text")
          .attr("x", -30)
          .attr("y", height - 3)
          .style("font-size", "8px")
          .text(data[data.length - 1].id)
      }
    }
  }
  return (
    <div className="chart" css={cssHightChart}>
      <svg ref={ref}></svg>
    </div>
  )
}

export default DrawChart

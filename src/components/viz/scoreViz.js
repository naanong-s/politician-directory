import React, { useRef, useEffect, useState } from "react"
import { media } from "../../styles"
import * as d3 from "d3"

const cssTimeLine = {
  display: "none",
  [media(767)]: {
    width: "100%",
    display: "flex",
  },
}

const cssTimeLineCon = {
  display: "none",
  [media(767)]: {
    width: "100%",
    display: "flex",
  },
}

const cssLollipopCon = {
  overflowX: "scroll",
  [media(767)]: {
    height: "43.6rem",
    background: "rgba(238,240,144, 0.1)",
    marginTop: "2.6rem",
    overflowX: "hidden",
    overflowY: "hidden",
    position: "relative",
  },
}

const cssLabel = {
  width: "7.6rem",
  height: "2.4rem",
  borderRadius: "0.3rem",
  position: "relative",
  background: "#EEF090",
  textAlign: "center",
  fontSize: "1.4rem",
  marginBottom: "0.8rem",
  zIndex: 9,
  left: 0,
}

const cssLabelCon = {
  height: "39.4rem",
  width: "24rem",
  position: "sticky",
  marginTop: "-34rem",
  left: 0,
  zIndex: 9,
  pointerEvents: "none",
}

const cssScoreText = {
  fontSize: "1.2rem",
}

const cssTooltipStyle = {
  position: "fixed",
  width: "20.6rem",
  background: "#fff",
  boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.25)",
  borderRadius: "0.4rem",
  padding: "1.2rem",
  zIndex: 99999,
  p: {
    fontSize: "1.2rem",
    marginBottom: "0.4rem",
  },
  a: {
    textDecoration: "underline",
    fontSize: "1rem",
    color: "#999C00",
  },
}

const cssCloseBtn = {
  position: "absolute",
  top: 0,
  right: 5,
  cursor: "pointer",
}

const cssLineCon = {
  position: "sticky",
  width: "100%",
  left: 0,
  display: "flex",
  alignItems: "center",
  p: {
    fontSize: "1rem",
    margin: 0,
    padding: 0,
  },
}

const cssLine = {
  width: "100%",
  height: "0.1rem",
}

const cssLegend = {
  position: "absolute",
  top: 0,
}

const type = ["โดยตำแหน่ง", "เลือกโดย คสช.", "เลือกกันเอง"]
const typeColor = d3
  .scaleOrdinal()
  .domain(type)
  .range(["#999C00", "#5739AC", "#FEACAC"])

function prepareData(senateVoteData) {
  const meanScore =
    senateVoteData.map(d => d.score).reduce((acc, cur) => acc + cur, 0) /
    senateVoteData.length
  const criteriaScore = [50, 60, 70, 80]
  const fGrade = senateVoteData.filter(senator => senator.score < 50).length
  const dGrade = senateVoteData.filter(
    senator => senator.score > 50 && senator.score < 60
  ).length
  const cGrade = senateVoteData.filter(
    senator => senator.score > 60 && senator.score < 70
  ).length
  const bGrade = senateVoteData.filter(
    senator => senator.score > 70 && senator.score < 80
  ).length
  const aGrade = senateVoteData.filter(senator => senator.score > 80).length
  const labelGradeData = [
    { grade: "A", score: aGrade },
    { grade: "B", score: bGrade },
    { grade: "C", score: cGrade },
    { grade: "D", score: dGrade },
    { grade: "F", score: fGrade },
  ]
  const posScore = criteriaScore.map(score => {
    return senateVoteData.findIndex(d => Math.floor(d.score) === score)
  })
  const meanPos = senateVoteData.filter(
    d => Math.floor(d.score) === Math.floor(meanScore)
  )[0].id
  return {
    criteriaScore,
    posScore,
    meanPos,
    labelGradeData,
  }
}

function createChart(
  data,
  timelineRef,
  lollipopRef,
  setTooltip,
  setTooltipStyle
) {
  const { criteriaScore, posScore, meanPos } = prepareData(data)

  const miniHeight = 88
  const miniWidth = timelineRef.current.clientWidth

  const mainHeight = 394
  const mainWidth = lollipopRef.current.clientWidth
  const mainMargin = {
    left: 20,
    right: 20,
    bottom: 16,
    top: 34,
  }
  const maxWidth = 12000

  const brushWidth = (mainWidth / maxWidth) * miniWidth

  function brushmove() {
    const extentX = d3.event.selection
    const newXcor = -extentX[0] * (maxWidth / mainWidth)
    d3.select(lollipopRef.current).style(
      "transform",
      `translate(${newXcor}px,0px)`
    )
  }

  function scroll() {
    const gBrush = d3.select(".brush")
    let selection = d3.brushSelection(gBrush.node())
    let size = selection[1] - selection[0],
      range = xTimeline.range(),
      x0 = d3.min(range),
      x1 = d3.max(range),
      dx = -d3.event.deltaX,
      topSection

    if (selection[0] - dx < x0) {
      topSection = x0
    } else if (selection[1] - dx > x1) {
      topSection = x1 - size
    } else {
      topSection = selection[0] - dx
    }
    d3.event.stopPropagation()
    d3.event.preventDefault()
    gBrush.call(brush.move, [topSection, topSection + size])
  }

  const brush = d3
    .brushX()
    .extent([[0, 0], [miniWidth, miniHeight]])
    .on("brush", brushmove)

  const timelineSvg = d3
    .select(timelineRef.current)
    .append("svg")
    .attr("width", miniWidth)
    .attr("height", miniHeight)
    .style("pointer-events", "none")

  const xTimeline = d3
    .scaleBand()
    .domain(
      data.map(function(d) {
        return d.id
      })
    )
    .range([0, miniWidth])
    .padding(0.2)

  timelineSvg
    .append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [0, brushWidth])

  const yTimeline = d3
    .scaleLinear()
    .domain([0, 100])
    .range([miniHeight, 0])

  const miniBar = timelineSvg
    .selectAll("timelineBar")
    .data(data)
    .enter()
  miniBar
    .append("rect")
    .attr("class", "miniBar")
    .attr("x", function(d) {
      return xTimeline(d.id)
    })
    .attr("y", function(d) {
      return yTimeline(d.score)
    })
    .attr("width", xTimeline.bandwidth())
    .attr("height", function(d) {
      return miniHeight - yTimeline(d.score)
    })
    .attr("fill", function(d) {
      return typeColor(d.senator_method)
    })

  d3.selectAll(".handle").style("pointer-events", "none")
  d3.select(".overlay").style("pointer-events", "none")

  posScore.forEach(pos => {
    if (pos === -1) return
    timelineSvg
      .append("line")
      .attr("x1", xTimeline(data[pos].id))
      .attr("x2", xTimeline(data[pos].id))
      .attr("y1", 0)
      .attr("y2", 88)
      .attr("stroke", "#AEAEAE")
      .attr("stroke-dasharray", "4")
  })

  timelineSvg
    .append("line")
    .attr("x1", xTimeline(meanPos))
    .attr("x2", xTimeline(meanPos))
    .attr("y1", 0)
    .attr("y2", 88)
    .attr("stroke", "#F0324B")

  const lolliSvg = d3
    .select(lollipopRef.current)
    .append("svg")
    .attr("height", mainHeight + mainMargin.top)
    .attr("width", maxWidth)
    .on("wheel.zoom", scroll)

  const xLolli = d3
    .scaleBand()
    .domain(data.map(d => d.id))
    .range([0, maxWidth])
    .paddingInner(0.9)
    .paddingOuter(0.5)

  lolliSvg
    .append("g")
    .attr("transform", `translate(0,378)`)
    .call(
      d3
        .axisBottom(xLolli)
        .tickSizeOuter(0)
        .tickSizeInner(0)
        .tickFormat(function(_, i) {
          return i + 1
        })
    )

  const yLolli = d3
    .scaleLinear()
    .domain([0, 100])
    .range([mainHeight, mainMargin.top + 40])

  lolliSvg
    .selectAll("group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "group")
    .append("rect")
    .attr("class", "lolliBar")
    .attr("x", function(d) {
      return xLolli(d.id)
    })
    .attr("y", function(d) {
      return yLolli(d.score) - mainMargin.bottom
    })
    .attr("width", xLolli.bandwidth())
    .attr("height", function(d) {
      return mainHeight - yLolli(d.score)
    })
    .attr("fill", function(d) {
      return typeColor(d.senator_method)
    })

  d3.selectAll(".group")
    .append("text")
    .attr("class", "percentText")
    .attr("x", function(d) {
      return xLolli(d.id) - 5
    })
    .attr("y", function(d) {
      return yLolli(d.score) - mainMargin.bottom - 20 - 30
    })
    .attr("fill", "#828282")
    .attr("font-size", "1.2rem")
    .attr("dominant-baseline", "middle")
    // .attr("text-anchor", "middle")
    .text(function(d) {
      return `${d.score.toFixed(0)}%`
    })

  d3.select(".selection")
    .attr("fill", "#EEF090")
    .attr("stroke-width", 1)
    .attr("stroke", "rgba(0,0,0,0.2)")
    .attr("z-index", 9999999)

  criteriaScore.forEach((score, i) => {
    const strokeType = score === 100 ? "stroke-width" : "stroke-dasharray"
    const strokeWidth = score === 100 ? 1 : 0.5
    lolliSvg
      .append("line")
      .attr("x1", 0)
      .attr("x2", maxWidth)
      .attr("y1", yLolli(score) - mainMargin.bottom)
      .attr("y2", yLolli(score) - mainMargin.bottom)
      .attr("stroke", "#AEAEAE")
      .attr(strokeType, "2")
      .attr("stroke-width", strokeWidth)
  })

  d3.selectAll(".group")
    .append("svg:defs")
    .append("svg:pattern")
    .attr("id", function(_, i) {
      return "profile" + i
    })
    .attr("width", 40)
    .attr("height", 40)
    .attr("patternUnits", "userSpaceOnUse")
    .append("svg:image")
    .attr("xlink:href", function(d) {
      return `https://elect.thematter.co/data/politicians/${
        d.name
      }-${d.lastname.replace(/ /g, "-")}.jpg`
    })
    .attr("width", 40)
    .attr("height", 40)
    .attr("x", 0)
    .attr("y", 0)

  let isClicked = false

  d3.selectAll(".group")
    .append("circle")
    .attr("transform", function(d) {
      const x = xLolli(d.id) - 20 + xLolli.bandwidth() / 2
      const y = yLolli(d.score) - mainMargin.bottom - 40
      return `translate(${x}, ${y})`
    })
    .attr("cx", 20)
    .attr("cy", 20)
    .attr("r", 20)
    .style("fill", "#fff")
    .style("fill", function(_, i) {
      return "url(#profile" + i + ")"
    })
    .style("cursor", "pointer")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("mouseover", function(d) {
      if (!isClicked) {
        const tooltipTop = d3.event.clientY - mainMargin.bottom - 120
        const tooltipLeft =
          d3.event.clientX + 250 > window.innerWidth
            ? d3.event.clientX - 200
            : d3.event.clientX + 10
        setTooltip(d)
        setTooltipStyle({
          ...cssTooltipStyle,
          top: tooltipTop,
          left: tooltipLeft,
          overflow: "hidden",
          opacity: 1,
        })
      }
    })
    .on("click", function() {
      isClicked = !isClicked
      d3.select("#closeBtn").on("click", function() {
        isClicked = !isClicked
        setTooltipStyle({
          width: 0,
          height: 0,
          top: null,
          left: null,
          opacity: 0,
        })
      })
    })
    .on("mouseout", function() {
      if (!isClicked) {
        setTooltipStyle({
          width: 0,
          height: 0,
          top: null,
          left: null,
          opacity: 0,
        })
      }
    })
}

function updateChart(filter) {
  if (filter === "โดยตำแหน่ง") {
    d3.selectAll(".group").style("opacity", function(d) {
      return filter !== d.senator_method ? "0.1" : "1"
    })
    d3.selectAll(".miniBar").style("opacity", function(d) {
      return filter !== d.senator_method ? "0.1" : "1"
    })
  } else if (filter === "เลือกโดย คสช.") {
    d3.selectAll(".group").style("opacity", function(d) {
      return filter !== d.senator_method ? "0.1" : "1"
    })
    d3.selectAll(".miniBar").style("opacity", function(d) {
      return filter !== d.senator_method ? "0.1" : "1"
    })
  } else if (filter === "เลือกกันเอง") {
    d3.selectAll(".group").style("opacity", function(d) {
      return filter !== d.senator_method ? "0.1" : "1"
    })
    d3.selectAll(".miniBar").style("opacity", function(d) {
      return filter !== d.senator_method ? "0.1" : "1"
    })
  } else {
    d3.selectAll(".group").style("opacity", function(d) {
      return "1"
    })
    d3.selectAll(".miniBar").style("opacity", function(d) {
      return "1"
    })
  }
}

function CreateLabel({ gradeObj }) {
  return (
    <div css={{ ...cssLabel }}>
      <strong>{gradeObj.grade}</strong>{" "}
      <span css={{ ...cssScoreText }}>{gradeObj.score} คน</span>
    </div>
  )
}

export default function(props) {
  const { senateVoteData, filter } = props
  const { labelGradeData } = prepareData(senateVoteData)
  const timelineRef = useRef(null)
  const lollipopRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)
  const [tooltipStyle, setTooltipStyle] = useState({
    position: "absolute",
    width: 0,
    left: null,
    top: null,
    opacity: 0,
  })

  // const legend = [
  //   {
  //     label: "F",
  //     left: 120,
  //   },
  // ]

  useEffect(() => {
    createChart(
      senateVoteData,
      timelineRef,
      lollipopRef,
      setTooltip,
      setTooltipStyle
    )
  }, [])

  useEffect(() => {
    updateChart(filter)
  }, [filter])

  return (
    <div>
      {tooltip ? (
        <div css={{ ...tooltipStyle }}>
          <div css={{ ...cssCloseBtn }} id="closeBtn">
            x
          </div>
          <strong>
            <p>
              {tooltip.title} {tooltip.name} {tooltip.lastname}
            </p>
          </strong>
          <p>ระยะเวลาทำงาน 145 ครั้ง</p>
          <p>เข้าลงมติ {tooltip.votelog} ครั้ง</p>
          <a
            href={`https://theyworkforus.elect.in.th/people/${
              tooltip.name
            }-${tooltip.lastname.replace(/ /g, "-")}`}
            target="_blank"
            rel="noopener noreferrer"
            css={{ display: "flex", alignItems: "center" }}
          >
            ดูโปรไฟล์
            <svg css={{ width: 10, height: 10, fill: "none", marginLeft: 8 }}>
              <path
                d="M2.49999 1.66663H0.833328V9.16663H8.33333V7.49996"
                stroke="#999C00"
              />
              <line
                x1="8.68688"
                y1="1.18693"
                x2="3.68688"
                y2="6.18693"
                stroke="#999C00"
              />
              <path d="M5 0.833374H9.16667V5.00004" stroke="#999C00" />
            </svg>
          </a>
        </div>
      ) : (
        <></>
      )}
      <div css={{ ...cssTimeLineCon }}>
        {/* {legend.map(legend => {
          return (
            <div css={{ ...cssLegend, left: legend.left }}>{legend.label}</div>
          )
        })} */}
        <div ref={timelineRef} css={{ ...cssTimeLine }} />
      </div>
      <div css={{ ...cssLollipopCon }}>
        <div css={{ ...cssLineCon, top: "8rem", zIndex: 99998 }}>
          <div css={{ ...cssLine, background: "#AEAEAE" }} />
          <p css={{ width: "20rem", textAlign: "center" }}>คะแนนเต็ม 100%</p>
          <div css={{ ...cssLine, background: "#AEAEAE" }} />
        </div>
        <div css={{ ...cssLineCon, top: "16rem", zIndex: 99998 }}>
          <div css={{ ...cssLine, background: "#F0324B" }} />
          <p
            css={{
              width: "20rem",
              textAlign: "center",
              color: "#F0324B",
            }}
          >
            คะแนนเฉลี่ยน 75%
          </p>
          <div css={{ ...cssLine, background: "#F0324B" }} />
        </div>
        <div ref={lollipopRef} />
        <div css={{ ...cssLabelCon }}>
          {labelGradeData.map((gradeObj, index) => {
            return <CreateLabel gradeObj={gradeObj} key={index} />
          })}
        </div>
      </div>
    </div>
  )
}

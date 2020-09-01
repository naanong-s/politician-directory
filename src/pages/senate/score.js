import React, { useState } from "react"
import Layout from "../../components/layout"
import _ from "lodash"
import { graphql } from "gatsby"
import ScoreViz from "../../components/viz/scoreViz"
import SenateNavbar from "../../components/senate/senateNavbar"
import SenateChecklistPopup from "../../components/senate/senateChecklistPopup"
import { media } from "../../styles"

export const query = graphql`
  query {
    senateVoteData: allSenateVoteYaml {
      nodes {
        title
        name
        lastname
        id
        votelog {
          key
          value
        }
      }
    }
    senatorData: allPeopleYaml(filter: { is_senator: { eq: true } }) {
      edges {
        node {
          id
          title
          name
          lastname
          senator_method
        }
      }
    }
  }
`

const cssBody = {
  padding: "0 2rem 3.3rem",
  [media(767)]: {
    padding: "5.6rem 4.3rem 3.3rem 4.3rem",
  },
}

const cssSection = {
  display: "flex",
}

const cssSectionLeft = {
  width: "50%",
  h1: {
    fontSize: "2.8rem",
    marginTop: 0,
  },
  [media(767)]: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    marginRight: "8.8rem",
    h1: {
      fontSize: "4.8rem",
      fontWeight: "bold",
      marginTop: 0,
    },
  },
}

const cssSectionRight = {
  width: "50%",
  borderLeft: "1px solid #000000",
  paddingLeft: "1.5rem",
  h1: {
    fontSize: "1.2rem",
  },
  [media(767)]: {
    width: "32.8rem",
    borderLeft: "1px solid #000000",
    paddingLeft: "4.4rem",
    fontFamily: "Noto Sans Thai",
    h1: {
      fontSize: "1.8rem",
      fontWeight: "bold",
    },
  },
}

const cssCriteria = {
  fontSize: "1.4rem",
}

const cssViz = {
  width: "100%",
  marginTop: "4rem",
}

const cssFilterBtn = {
  width: "100%",
  cursor: "pointer",
  background: "#fff",
  borderRadius: "5rem",
  marginRight: "0.5rem",
  height: "4rem",
  display: "flex",
  alignItems: "center",
  padding: "0 1.6rem",
  margin: "0.5rem 0",
  [media(767)]: {
    cursor: "pointer",
    background: "#fff",
    borderRadius: "5rem",
    marginRight: "0.5rem",
    width: "25rem",
    height: "4rem",
    display: "flex",
    alignItems: "center",
    padding: "0 1.6rem",
    "&:hover": {
      border: "0.2rem solid rgba(0, 0, 0, 1)",
    },
  },
}

const cssCircle = {
  width: "1rem",
  height: "1rem",
  marginRight: "1.2rem",
  borderRadius: "50%",
}

const cssSelectcon = {
  display: "none",
  [media(767)]: {
    display: "block",
    h3: {
      fontSize: "1.8rem",
      fontFamily: "Noto Sans Thai",
    },
  },
}

const cssButtonCon = {
  marginTop: "0.6rem",
  marginBottom: "3rem",
  [media(767)]: {
    display: "flex",
    marginTop: "1.4rem",
    marginBottom: "2.4rem",
  },
}

const cssSelectConMobile = {
  display: "block",
  marginTop: "4rem",
  fontSize: "1.4rem",
  [media(767)]: {
    display: "none",
  },
}

const Motion = ({ data }) => {
  const [filter, setFilter] = useState(null)

  const handleFilterClick = newFilter => {
    if (filter === newFilter) {
      setFilter(null)
    } else {
      setFilter(newFilter)
    }
  }

  const senateVoteData = data.senateVoteData.nodes
    .map(senate => {
      const votelog = senate.votelog.reduce(
        (acc, motion) => (motion.value === "5" ? (acc += 0) : (acc += 1)),
        0
      )
      return {
        id: senate.id,
        title: senate.title,
        name: senate.name,
        lastname: senate.lastname,
        votelog: votelog,
        score: (votelog / senate.votelog.length) * 100,
        senator_method: data.senatorData.edges.find(
          senator => senator.node.id === senate.id
        ).node.senator_method,
      }
    })
    .sort((a, b) => {
      return a.score - b.score
    })

  const senatorCount = _.countBy(senateVoteData, "senator_method")
  return (
    <Layout pageStyles={{ background: "#fff" }}>
      <SenateNavbar />
      <SenateChecklistPopup />
      <body css={{ ...cssBody }}>
        <section css={{ ...cssSection }}>
          <div css={{ ...cssSectionLeft }}>
            <h1>คะแนนจิตพิสัย ส.ว.</h1>
            <div css={{ ...cssSelectcon }}>
              <b>เลือกดูตามประเภทส.ว.</b>
              <div css={{ ...cssButtonCon }}>
                <div
                  css={{
                    ...cssFilterBtn,
                    border:
                      filter === "โดยตำแหน่ง"
                        ? "0.2rem solid rgba(0, 0, 0, 1)"
                        : "0.2rem solid rgba(0, 0, 0, 0.3)",
                  }}
                  onClick={() => handleFilterClick("โดยตำแหน่ง")}
                >
                  <div css={{ ...cssCircle, background: "#999C00" }} />
                  โดยตำแหน่ง{" "}
                  <span style={{ color: "#999C00", flex: 1 }}>
                    {" "}
                    ({senatorCount["โดยตำแหน่ง"]} คน)
                  </span>
                  {filter === "โดยตำแหน่ง" ? <>X</> : <></>}
                </div>
                <div
                  css={{
                    ...cssFilterBtn,
                    border:
                      filter === "เลือกโดย คสช."
                        ? "0.2rem solid rgba(0, 0, 0, 1)"
                        : "0.2rem solid rgba(0, 0, 0, 0.3)",
                  }}
                  onClick={() => handleFilterClick("เลือกโดย คสช.")}
                >
                  <div css={{ ...cssCircle, background: "#5739AC" }} />
                  คสช. สรรหา{" "}
                  <span style={{ color: "#5739AC", flex: 1 }}>
                    {" "}
                    ({senatorCount["เลือกโดย คสช."]} คน)
                  </span>
                  {filter === "เลือกโดย คสช." ? <>X</> : <></>}
                </div>
                <div
                  css={{
                    ...cssFilterBtn,
                    border:
                      filter === "เลือกกันเอง"
                        ? "0.2rem solid rgba(0, 0, 0, 1)"
                        : "0.2rem solid rgba(0, 0, 0, 0.3)",
                  }}
                  onClick={() => handleFilterClick("เลือกกันเอง")}
                >
                  <div css={{ ...cssCircle, background: "#FEACAC" }} />
                  ตามกลุ่มอาชีพ
                  <span style={{ color: "#FEACAC", flex: 1 }}>
                    {" "}
                    ({senatorCount["เลือกกันเอง"]} คน)
                  </span>
                  {filter === "เลือกกันเอง" ? <>X</> : <></>}
                </div>
              </div>
              การเข้าประชุมและการลงมติในที่ประชุมถือเป็นหน้าที่หลักของ ส.ว.
              รัฐธรรมนูญกำหนดเงื่อนไขการพ้นตำแหน่ง ของ ส.ว.
              ที่ไม่เข้าร่วมประชุมสภาไว้ว่าภายในหนึ่งสมัย ต้องเข้าประชุม 75 %
              ยกเว้นประธานวุฒิสภาอนุญาตให้ขาด ครบวาระ 1 ปีไปแล้ว
              มาลองสำรวจดูกันว่า ส.ว. ในสภาของเรา ใครมา-ขาดการลงมติมากน้อยแค่ไหน
            </div>
          </div>
          <div css={{ ...cssSectionRight }}>
            <h1>เกณฑ์การให้คะแนน</h1>
            <div css={{ ...cssCriteria }}>
              เข้าลงมติ = 1 คะแนน/ครั้ง
              <br />
              ขาดลงมติ = 0 คะแนน/ครั้ง
              <br /> <b>เกรด A</b> = เข้า 80%ขึ้นไป
              <br /> <b>เกรด B</b> = เข้า 70-79%
              <br /> <b>เกรด C</b> = เข้า 60-69%
              <br /> <b>เกรด D</b> = เข้า 50-59%
              <br /> <b>เกรด F</b> = เข้าไม่ถึง 50%
            </div>
          </div>
        </section>
        <div css={{ ...cssSelectConMobile }}>
          <b>เลือกดูตามประเภทส.ว.</b>
          <div css={{ ...cssButtonCon }}>
            <div
              css={{
                ...cssFilterBtn,
                border:
                  filter === "โดยตำแหน่ง"
                    ? "0.2rem solid rgba(0, 0, 0, 1)"
                    : "0.2rem solid rgba(0, 0, 0, 0.3)",
              }}
              onClick={() => handleFilterClick("โดยตำแหน่ง")}
            >
              <div css={{ ...cssCircle, background: "#999C00" }} />
              โดยตำแหน่ง{" "}
              <span style={{ color: "#999C00", flex: 1 }}>
                {" "}
                ({senatorCount["โดยตำแหน่ง"]} คน)
              </span>
              {filter === "โดยตำแหน่ง" ? <>X</> : <></>}
            </div>
            <div
              css={{
                ...cssFilterBtn,
                border:
                  filter === "เลือกโดย คสช."
                    ? "0.2rem solid rgba(0, 0, 0, 1)"
                    : "0.2rem solid rgba(0, 0, 0, 0.3)",
              }}
              onClick={() => handleFilterClick("เลือกโดย คสช.")}
            >
              <div css={{ ...cssCircle, background: "#5739AC" }} />
              คสช. สรรหา{" "}
              <span style={{ color: "#5739AC", flex: 1 }}>
                {" "}
                ({senatorCount["เลือกโดย คสช."]} คน)
              </span>
              {filter === "เลือกโดย คสช." ? <>X</> : <></>}
            </div>
            <div
              css={{
                ...cssFilterBtn,
                border:
                  filter === "เลือกกันเอง"
                    ? "0.2rem solid rgba(0, 0, 0, 1)"
                    : "0.2rem solid rgba(0, 0, 0, 0.3)",
              }}
              onClick={() => handleFilterClick("เลือกกันเอง")}
            >
              <div css={{ ...cssCircle, background: "#FEACAC" }} />
              ตามกลุ่มอาชีพ
              <span style={{ color: "#FEACAC", flex: 1 }}>
                {" "}
                ({senatorCount["เลือกกันเอง"]} คน)
              </span>
              {filter === "เลือกกันเอง" ? <>X</> : <></>}
            </div>
          </div>
          การเข้าประชุมและการลงมติในที่ประชุมถือเป็นหน้าที่หลักของ ส.ว.
          รัฐธรรมนูญกำหนดเงื่อนไขการพ้นตำแหน่ง ของ ส.ว.
          ที่ไม่เข้าร่วมประชุมสภาไว้ว่าภายในหนึ่งสมัย ต้องเข้าประชุม 75 %
          ยกเว้นประธานวุฒิสภาอนุญาตให้ขาด ครบวาระ 1 ปีไปแล้ว มาลองสำรวจดูกันว่า
          ส.ว. ในสภาของเรา ใครมา-ขาดการลงมติมากน้อยแค่ไหน
        </div>
        <div css={{ ...cssViz }}>
          <ScoreViz senateVoteData={senateVoteData} filter={filter} />
        </div>
      </body>
    </Layout>
  )
}

export default Motion

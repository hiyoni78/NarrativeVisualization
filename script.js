async function enclosed() {
  //Default Canvas Height, Width, and Margin
  const margin = { top: 20, right: 30, bottom: 40, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const parseDate = d3.timeParse("%d/%m/%Y");
  const data = await d3.csv("./CleanedData.csv");

  data.forEach((d) => {
    d.Date = parseDate(d.Date);
  });

  async function GoalsScoredPerMonth() {
    const svgOverview = d3
      .select("#season-overview")
      .append("svg")
      .attr("width", width + margin.left + 150 + margin.right)
      .attr("height", height + margin.top + 170 + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left + 150},${margin.top + 80})`);

    const monthData = d3.rollups(
      data,
      (v) =>
        d3.sum(
          v,
          (d) =>
            Number(d["Full time home goals"]) +
            Number(d["Full time away goals"])
        ),
      (d) => d.Date.getMonth()
    );

    const monthDataArray = monthData.map(([month, goals]) => ({
      month,
      goals,
    }));

    const x = d3
      .scaleBand()
      .domain(monthDataArray.map((d) => d.month))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(monthDataArray, (d) => d.goals)])
      .nice()
      .range([height, 0]);

    svgOverview
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => d3.timeFormat("%B")(new Date(2023, d)))
      );

    svgOverview.append("g").call(d3.axisLeft(y));

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    function handleMouseOver(event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `Month: ${d3.timeFormat("%B")(new Date(2023, d.month))}<br/>Goals: ${
            d.goals
          }`
        )
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 28 + "px");
    }

    function handleMouseOut() {
      tooltip.transition().duration(500).style("opacity", 0);
    }

    svgOverview
      .selectAll(".bar")
      .data(monthDataArray)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.month))
      .attr("y", (d) => y(d.goals))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.goals))
      .attr("fill", "steelblue")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    svgOverview
      .append("g")
      .attr("transform", "translate(-40, " + height / 2 + ")")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Goals Scored");

    // Add annotations
    const annotations = [
      {
        note: { label: "High goal-scoring month", title: "December" },
        x: x(11) + x.bandwidth() / 12,
        y: y(monthDataArray.find((d) => d.month === 11).goals),
        dy: -10,
        dx: 0,
      },
    ];

    const makeAnnotations = d3.annotation().annotations(annotations);

    svgOverview
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations);
  }

  // Call the function to create Scene 1
  GoalsScoredPerMonth();

  // Function to create Scene 2: Detailed Breakdown for December
  function createDecemberBreakdown() {
    const decemberData = data.filter((d) => d.Date.getMonth() === 11);

    const svgDecember = d3
      .select("#december-breakdown")
      .append("svg")
      .attr("width", width + margin.left + 150 + margin.right)
      .attr("height", height + margin.top + 30 + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left + 150},${margin.top + 30})`);

    const xDecember = d3
      .scaleTime()
      .domain(d3.extent(decemberData, (d) => d.Date))
      .range([0, width]);

    const yDecember = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          decemberData,
          (d) =>
            Number(d["Full time home goals"]) +
            Number(d["Full time away goals"])
        ),
      ])
      .nice()
      .range([height, 0]);

    svgDecember
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xDecember).tickFormat(d3.timeFormat("%d-%b")));

    svgDecember.append("g").call(d3.axisLeft(yDecember));

    const tooltipDecember = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip2")
      .style("opacity", 0);

    function handleMouseOverDecember(event, d) {
      tooltipDecember.transition().duration(200).style("opacity", 0.9);
      tooltipDecember
        .html(
          `Date: ${d3.timeFormat("%d-%b")(d.Date)}<br/>Home: ${d.HomeTeam} ${
            d["Full time home goals"]
          }<br/>Away: ${d.AwayTeam} ${d["Full time away goals"]}`
        )
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 28 + "px");
    }

    function handleMouseOutDecember() {
      tooltipDecember.transition().duration(500).style("opacity", 0);
    }

    // Adding slight jitter to avoid overlapping points
    const jitterWidth = 10;

    svgDecember
      .selectAll(".dot")
      .data(decemberData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr(
        "cx",
        (d) => xDecember(d.Date) + Math.random() * jitterWidth - jitterWidth / 2
      )
      .attr("cy", (d) =>
        yDecember(
          Number(d["Full time home goals"]) + Number(d["Full time away goals"])
        )
      )
      .attr("r", 5)
      .attr("stroke", "steelblue")
      .attr("fill", "transparent")
      .on("mouseover", handleMouseOverDecember)
      .on("mouseout", handleMouseOutDecember);

    svgDecember
      .append("g")
      .attr("transform", "translate(-40, " + height / 2 + ")")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Goals Scored per Game");
  }

  // Call the function to create Scene 2
  createDecemberBreakdown();

  // Function to create Scene 3: Season Goal Summary by team
  function createInteractiveSeasonSummary() {
    const teamStats = {};

    data.forEach((match) => {
      [match.HomeTeam, match.AwayTeam].forEach((team) => {
        if (!teamStats[team]) {
          teamStats[team] = { goalsScored: 0, goalsConceded: 0, points: 0 };
        }
      });

      teamStats[match.HomeTeam].goalsScored += Number(
        match["Full time home goals"]
      );
      teamStats[match.HomeTeam].goalsConceded += Number(
        match["Full time away goals"]
      );
      teamStats[match.AwayTeam].goalsScored += Number(
        match["Full time away goals"]
      );
      teamStats[match.AwayTeam].goalsConceded += Number(
        match["Full time home goals"]
      );

      switch (match["Full time result"]) {
        case "H":
          teamStats[match.HomeTeam].points += 3;
          break;
        case "A":
          teamStats[match.AwayTeam].points += 3;
          break;
        case "D":
          teamStats[match.HomeTeam].points += 1;
          teamStats[match.AwayTeam].points += 1;
          break;
      }
    });

    const teamsArray = Object.keys(teamStats).map((team) => ({
      team,
      goalsScored: teamStats[team].goalsScored,
      goalsConceded: teamStats[team].goalsConceded,
      points: teamStats[team].points,
    }));

    teamsArray.forEach((team) => {
      if (team.team === "Everton") {
        team.points -= 8;
      } else if (team.team === "Nott'm Forest") {
        team.points -= 4;
      }
    });

    teamsArray.sort(
      (a, b) =>
        b.points - a.points ||
        b.goalsScored - b.goalsConceded - (a.goalsScored - a.goalsConceded)
    );

    const svgOverview = d3
      .select("#season-conclusion")
      .append("svg")
      .attr("width", width + margin.left + 150 + margin.right)
      .attr("height", height + (margin.top + 80) + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left + 250},${margin.top + 50})`);

    const x = d3
      .scaleBand()
      .range([0, width - margin.left - margin.right])
      .padding(0.1)
      .domain(teamsArray.map((d) => d.team));

    const y = d3
      .scaleLinear()
      .range([height - margin.top - margin.bottom, 0])
      .domain([
        0,
        d3.max(teamsArray, (d) => Math.max(d.goalsScored, d.goalsConceded)),
      ]);

    svgOverview
      .append("g")
      .attr(
        "transform",
        "translate(0," + (height - margin.top - margin.bottom) + ")"
      )
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    svgOverview.append("g").call(d3.axisLeft(y));

    svgOverview
      .selectAll(".bar-scored")
      .data(teamsArray)
      .enter()
      .append("rect")
      .style("fill", "steelblue")
      .attr("x", (d) => x(d.team))
      .attr("width", x.bandwidth() / 2)
      .attr("y", (d) => y(d.goalsScored))
      .attr(
        "height",
        (d) => height - margin.top - margin.bottom - y(d.goalsScored)
      )
      .append("title")
      .text((d) => {
        if (d.team === "Everton") {
          return `Team: ${d.team}\nGoals Scored: ${d.goalsScored}\nPoints: ${
            d.points
          }\nFinal League Position: ${
            teamsArray.indexOf(d) + 1
          }\n*Everton has been deducted 8 points`;
        } else if (d.team === "Nott'm Forest") {
          return `Team: ${d.team}\nGoals Scored: ${d.goalsScored}\nPoints: ${
            d.points
          }\nFinal League Position: ${
            teamsArray.indexOf(d) + 1
          }\n*Nottingham Forest has been deducted 4 points`;
        } else {
          return `Team: ${d.team}\nGoals Scored: ${d.goalsScored}\nPoints: ${
            d.points
          }\nFinal League Position: ${teamsArray.indexOf(d) + 1}`;
        }
      });

    svgOverview
      .selectAll(".bar-conceded")
      .data(teamsArray)
      .enter()
      .append("rect")
      .style("fill", "tomato")
      .attr("x", (d) => x(d.team) + x.bandwidth() / 2)
      .attr("width", x.bandwidth() / 2)
      .attr("y", (d) => y(d.goalsConceded))
      .attr(
        "height",
        (d) => height - margin.top - margin.bottom - y(d.goalsConceded)
      )
      .append("title")
      .text((d) => {
        if (d.team === "Everton") {
          `Team: ${d.team}\nGoals Conceded: ${d.goalsConceded}\nPoints: ${
            d.points
          }\nRank: ${
            teamsArray.indexOf(d) + 1
          }\n*Everton has been deducted 8 points`;
        } else if (d.team === "Nott'm Forest") {
          `Team: ${d.team}\nGoals Conceded: ${d.goalsConceded}\nPoints: ${
            d.points
          }\nRank: ${
            teamsArray.indexOf(d) + 1
          }\n*Nottingham Forest has been deducted 4 points`;
        } else {
          return `Team: ${d.team}\nGoals Conceded: ${
            d.goalsConceded
          }\nPoints: ${d.points}\nRank: ${teamsArray.indexOf(d) + 1}`;
        }
      });

    svgOverview
      .append("g")
      .attr("transform", "translate(-40, " + height / 2 + ")")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Goals");

    const legend = svgOverview
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(["Goals Scored", "Goals Conceded"])
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", -(margin.left + 100))
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d) => (d === "Goals Scored" ? "steelblue" : "tomato"));

    legend
      .append("text")
      .attr("x", -(margin.left + 124))
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text((d) => d);
  }

  // Call the function to create Scene 3
  createInteractiveSeasonSummary();
}
enclosed();

let slideIndex = 1;
showSlides(slideIndex);

function changeSlide(n) {
  showSlides((slideIndex += n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  
  if (n > slides.length) {
    slideIndex = 1;
  }
  
  if (n < 1) {
    slideIndex = slides.length;
  }

  if(n === 1) {
    document.querySelector('#prev').style.display = 'none';
    document.querySelector('#next').style.display = 'inline';

  }
  else if (n === 3) {
    document.querySelector('#prev').style.display = 'inline';
    document.querySelector('#next').style.display = 'none';
  }
  else {
    document.querySelector('#prev').style.display = 'inline';
    document.querySelector('#next').style.display = 'inline';
  }
  
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  
  slides[slideIndex - 1].style.display = "block";
}

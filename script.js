async function enclosed() {
  const margin = { top: 70, right: 30, bottom: 40, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svgOverview = d3
    .select("#season-overview")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse("%d/%m/%Y");
  const data = await d3.csv("./CleanedData.csv");

  data.forEach((d) => {
    d.Date = parseDate(d.Date);
  });

  const monthData = d3.rollups(
    data,
    (v) =>
      d3.sum(
        v,
        (d) =>
          Number(d["Full time home goals"]) + Number(d["Full time away goals"])
      ),
    (d) => d.Date.getMonth()
  );

  // Convert the monthData to an array of objects
  const monthDataArray = monthData.map(([month, goals]) => ({ month, goals }));

  // Create the x and y scales
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

  // Create the x axis
  svgOverview
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x).tickFormat((d) => d3.timeFormat("%B")(new Date(2023, d)))
    );

  // Create the y axis
  svgOverview.append("g").call(d3.axisLeft(y));

  // Create the tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Function to handle mouseover event
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

  // Function to handle mouseout event
  function handleMouseOut() {
    tooltip.transition().duration(500).style("opacity", 0);
  }

  // Bars for the overview chart with event listeners for interactivity
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

  // Function to create Scene 2: Detailed Breakdown for December
  function createDecemberBreakdown() {
    const decemberData = data.filter((d) => d.Date.getMonth() === 11); // December is month 11

    const svgDecember = d3
      .select("#december-breakdown")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the x and y scales for December
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

    // Create the tooltip for December
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
    const jitterWidth = 10; // Adjust the jitter width as needed

    // Circles for the detailed breakdown chart with event listeners for interactivity
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
  }

  // Call the function to create Scene 2
  createDecemberBreakdown();

  // Function to create an interactive season summary
  function createInteractiveSeasonSummary() {
    // Set up the SVG for interactive visualization
    const svgInteractive = d3
      .select("#season-conclusion")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + (margin.top + 80) + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Example data: total goals by team
    const goalsByTeam = d3.rollups(
      data,
      (v) => d3.sum(v, (d) => Number(d["Full time home goals"])),
      (d) => d.HomeTeam
    );
    goalsByTeam.sort((a, b) => b[1] - a[1]); // Sort by total goals for better visual presentation

    // Scales
    const x = d3
      .scaleBand()
      .domain(goalsByTeam.map((d) => d[0]))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(goalsByTeam, (d) => d[1])])
      .range([height, 0]);

    // Axes
    svgInteractive
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.1em")
      .attr("dy", "-0.15em")
      .attr("transform", "rotate(-65)");

    svgInteractive.append("g").call(d3.axisLeft(y));

    // Bars with tooltips and hover effects
    svgInteractive
      .selectAll(".bar")
      .data(goalsByTeam)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d[0]))
      .attr("y", (d) => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d[1]))
      .attr("fill", "darkblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");
        tooltip
          .html("Team: " + d[0] + "<br>Total Home Goals: " + d[1])
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 15 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "darkblue");
        tooltip.style("opacity", 0);
      });

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("text-align", "center")
      .style("width", "140px")
      .style("height", "40px")
      .style("padding", "2px")
      .style("font", "12px sans-serif")
      .style("background", "lightsteelblue")
      .style("border", "0px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  }

  // Call to initialize the interactive summary
  createInteractiveSeasonSummary();
}
enclosed();

// script.js, after the D3 code
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
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}

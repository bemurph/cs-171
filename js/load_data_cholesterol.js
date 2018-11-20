var mean_cholesterol = [];
var raise_cholesterol5 = [];
var raise_cholesterol6 = [];

var processcholesterolRow = function(d) {
    return {
        Country: d.Country,
        Gender: d.Gender,
        ["2009"]: +d["2009"],
        ["2008"]: +d["2008"],
        ["2007"]: +d["2007"],
        ["2006"]: +d["2006"],
        ["2005"]: +d["2005"],
        ["2004"]: +d["2004"],
        ["2003"]: +d["2003"],
        ["2002"]: +d["2002"],
        ["2001"]: +d["2001"],
        ["2000"]: +d["2000"],
        ["1999"]: +d["1999"],
        ["1998"]: +d["1998"],
        ["1997"]: +d["1997"],
        ["1996"]: +d["1996"],
        ["1995"]: +d["1995"],
        ["1994"]: +d["1994"],
        ["1993"]: +d["1993"],
        ["1992"]: +d["1992"],
        ["1991"]: +d["1991"],
        ["1990"]: +d["1990"],
        ["1989"]: +d["1989"],
        ["1988"]: +d["1988"],
        ["1987"]: +d["1987"],
        ["1986"]: +d["1986"],
        ["1985"]: +d["1985"],
        ["1984"]: +d["1984"],
        ["1983"]: +d["1983"],
        ["1982"]: +d["1982"],
        ["1981"]: +d["1981"],
        ["1980"]: +d["1980"]
    }
}

var processraisedcholesterolRow = function(d) {
    return {
        Country: d.Country,
        ["Both sexes"]: +d["Both sexes"],
        Male: +d.Male,
        Female: +d.Female
    }
}

d3.csv("data/mean-total-blood-cholesterol-age-adjusted.csv", processcholesterolRow, function(data) {
    mean_cholesterol = data;
    // console.log(data);
});

d3.csv("data/raised-total-cholesterol-adult-5plus-2008.csv", processraisedcholesterolRow, function(data) {
    raise_cholesterol5 = data;
    // console.log(data);
});

d3.csv("data/raised-total-cholesterol-adult-6plus-2008.csv", processraisedcholesterolRow, function(data) {
    raise_cholesterol6 = data;
    // console.log(data);
});

const selectBox = [];

for (let i=0; i < mean_cholesterol.length; i++) {
    const country = mean_cholesterol[i].Country;
    selectBox.push(country)
}

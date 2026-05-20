import React, { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from "recharts";

const COLORS = [
  "#00FF9C",
  "#00B4FF",
  "#FFD700",
  "#FF4D6D",
  "#B388FF"
];

export default function MoodAnalytics() {

  const [dashboardData, setDashboardData] =
    useState(null);

  // =========================
  // Fetch Backend Analytics
  // =========================

  useEffect(() => {

    fetch(
      "http://127.0.0.1:5000/api/analytics/dashboard"
    )
      .then(res => res.json())
      .then(data => {

        setDashboardData(data);

      })
      .catch(err => {

        console.log(err);

      });

  }, []);

  if (!dashboardData) {

    return (
      <div style={{
        color: "white",
        padding: 30
      }}>
        Loading Analytics...
      </div>
    );
  }

  // =========================
  // Emotion Pie Data
  // =========================

  const emotionData = Object.entries(
    dashboardData.emotion_distribution
  ).map(([name, value]) => ({
    name,
    value
  }));

  // =========================
  // Wellness Line Data
  // =========================

  const trendData = [
    {
      day: "Mon",
      stress: 65,
      focus: 72,
      mood: 78
    },
    {
      day: "Tue",
      stress: 55,
      focus: 75,
      mood: 80
    },
    {
      day: "Wed",
      stress: 70,
      focus: 68,
      mood: 74
    },
    {
      day: "Thu",
      stress: 60,
      focus: 82,
      mood: 85
    },
    {
      day: "Fri",
      stress: 50,
      focus: 88,
      mood: 90
    }
  ];

  return (

    <div style={{
      padding: 20,
      display: "grid",
      gap: 20
    }}>

      {/* ========================= */}
      {/* Top Cards */}
      {/* ========================= */}

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: 20
      }}>

        <Card
          title="Wellness Score"
          value={
            dashboardData.average_mood + "%"
          }
          color="#00FF9C"
        />

        <Card
          title="Stress Level"
          value={
            dashboardData.average_stress + "%"
          }
          color="#FF4D6D"
        />

        <Card
          title="Attention Level"
          value={
            dashboardData.average_attention + "%"
          }
          color="#00B4FF"
        />

        <Card
          title="Fatigue Index"
          value={
            dashboardData.average_fatigue + "%"
          }
          color="#FFD700"
        />

      </div>

      {/* ========================= */}
      {/* Charts */}
      {/* ========================= */}

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "1fr 1fr",
        gap: 20
      }}>

        {/* Emotion Distribution */}

        <div style={glassCard()}>

          <h3 style={titleStyle()}>
            Emotion Distribution
          </h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={emotionData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
              >

                {
                  emotionData.map(
                    (entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    )
                  )
                }

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Weekly Wellness */}

        <div style={glassCard()}>

          <h3 style={titleStyle()}>
            Weekly Wellness Trends
          </h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <LineChart data={trendData}>

              <CartesianGrid
                stroke="#ffffff10"
              />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="stress"
                stroke="#FF4D6D"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="focus"
                stroke="#00B4FF"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="mood"
                stroke="#00FF9C"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ========================= */}
      {/* Bar Chart */}
      {/* ========================= */}

      <div style={glassCard()}>

        <h3 style={titleStyle()}>
          Wellness Metrics
        </h3>

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <BarChart data={trendData}>

            <CartesianGrid
              stroke="#ffffff10"
            />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="stress"
              fill="#FF4D6D"
            />

            <Bar
              dataKey="focus"
              fill="#00B4FF"
            />

            <Bar
              dataKey="mood"
              fill="#00FF9C"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

// =========================
// Card Component
// =========================

function Card({
  title,
  value,
  color
}) {

  return (

    <div style={{
      background: "#0b1020",
      borderRadius: 20,
      padding: 24,
      border: `1px solid ${color}33`,
      boxShadow: `0 0 25px ${color}22`
    }}>

      <div style={{
        fontSize: 13,
        color: "#aaa",
        marginBottom: 10
      }}>
        {title}
      </div>

      <div style={{
        fontSize: 34,
        fontWeight: 800,
        color
      }}>
        {value}
      </div>

    </div>
  );
}

// =========================
// Styles
// =========================

function glassCard() {

  return {

    background: "#0b1020",

    borderRadius: 20,

    padding: 20,

    border: "1px solid #ffffff10",

    boxShadow:
      "0 0 30px rgba(0,0,0,0.4)"
  };
}

function titleStyle() {

  return {

    color: "white",

    marginBottom: 20
  };
}
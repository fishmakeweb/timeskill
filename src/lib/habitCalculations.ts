import { IHabitRules } from "@/models/User";

interface HabitData {
  exercise: number;
  water: number;
  sleep: number;
  calories: number;
}

export function calculateHabitScore(
  data: HabitData,
  rules: IHabitRules,
): number {
  let score = 0;

  // Exercise score (0-weight points)
  const exerciseScore =
    Math.min(data.exercise / rules.exercise.target, 1) * rules.exercise.weight;
  score += exerciseScore;

  // Water score (0-weight points)
  const waterScore =
    Math.min(data.water / rules.water.target, 1) * rules.water.weight;
  score += waterScore;

  // Sleep score (0-weight points)
  const sleepScore =
    Math.min(data.sleep / rules.sleep.target, 1) * rules.sleep.weight;
  score += sleepScore;

  // Calories score (0-weight points) - optimal range
  let caloriesScore = 0;
  if (
    data.calories >= rules.calories.min &&
    data.calories <= rules.calories.max
  ) {
    caloriesScore = rules.calories.weight;
  } else if (data.calories < rules.calories.min) {
    caloriesScore =
      (data.calories / rules.calories.min) * rules.calories.weight;
  } else {
    // Above max - decrease linearly
    const excess = data.calories - rules.calories.max;
    const penalty = Math.min(excess / 500, 1); // Penalty for each 500 kcal over
    caloriesScore = rules.calories.weight * (1 - penalty * 0.5);
  }
  score += caloriesScore;

  return Math.round(score * 10) / 10; // Round to 1 decimal
}

export const defaultHabitRules: IHabitRules = {
  exercise: { weight: 20, target: 1 },
  water: { weight: 20, target: 2 },
  sleep: { weight: 30, target: 7 },
  calories: { weight: 30, min: 2000, max: 2500 },
};

// Calculate streak: consecutive days with score >= 70
export function calculateStreak(
  habits: Array<{ date: Date | string; score: number }>,
): number {
  if (habits.length === 0) return 0;

  // Sort by date descending (most recent first)
  const sorted = [...habits].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const habit of sorted) {
    const habitDate = new Date(habit.date);
    habitDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === streak && habit.score >= 70) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

// Calculate average for a specific metric
export function calculateAverage(
  habits: Array<{
    exercise: number;
    water: number;
    sleep: number;
    calories: number;
  }>,
  metric: "exercise" | "water" | "sleep" | "calories",
): number {
  if (habits.length === 0) return 0;
  const sum = habits.reduce((acc, habit) => acc + habit[metric], 0);
  return Math.round((sum / habits.length) * 10) / 10;
}

// Generate insights based on habit data
export function generateInsights(
  habits: Array<{
    exercise: number;
    water: number;
    sleep: number;
    calories: number;
    score: number;
  }>,
): string[] {
  if (habits.length === 0) {
    return ["📊 Bắt đầu check-in hàng ngày để nhận gợi ý cải thiện!"];
  }

  const insights: string[] = [];
  const avgSleep = calculateAverage(habits, "sleep");
  const avgExercise = calculateAverage(habits, "exercise");
  const avgWater = calculateAverage(habits, "water");
  const avgCalories = calculateAverage(habits, "calories");
  const avgScore = habits.reduce((acc, h) => acc + h.score, 0) / habits.length;

  // Sleep insights
  if (avgSleep < 6.5) {
    insights.push("💤 Tăng giờ ngủ để cải thiện sức khỏe và điểm số");
  } else if (avgSleep >= 7.5) {
    insights.push("✨ Thói quen ngủ của bạn rất tốt!");
  }

  // Exercise insights
  if (avgExercise === 0) {
    insights.push("🏃 Bắt đầu tập thể dục đều đặn để nâng cao sức khỏe");
  } else if (avgExercise < 0.5) {
    insights.push(
      "💪 Cố gắng tăng thời gian tập thể dục lên ít nhất 30 phút/ngày",
    );
  } else if (avgExercise >= 1) {
    insights.push("🎯 Tuyệt vời! Bạn đang duy trì thói quen tập luyện tốt");
  }

  // Water insights
  if (avgWater < 1.5) {
    insights.push("💧 Hãy uống nhiều nước hơn - mục tiêu 2 lít/ngày");
  } else if (avgWater >= 2) {
    insights.push("💦 Tốt! Bạn đang duy trì lượng nước đủ cho cơ thể");
  }

  // Calories insights
  if (avgCalories < 1800) {
    insights.push("🍽️ Lượng calories hơi thấp - cân nhắc tăng dinh dưỡng");
  } else if (avgCalories > 2700) {
    insights.push("⚠️ Lượng calories hơi cao - cân nhắc điều chỉnh chế độ ăn");
  } else if (avgCalories >= 2000 && avgCalories <= 2500) {
    insights.push("🎉 Chế độ dinh dưỡng của bạn rất cân bằng!");
  }

  // Overall performance
  if (avgScore >= 80) {
    insights.push("🌟 Xuất sắc! Hãy tiếp tục duy trì!");
  } else if (avgScore >= 60) {
    insights.push("📈 Bạn đang làm tốt! Cải thiện thêm một chút nữa");
  } else {
    insights.push("💡 Hãy tập trung cải thiện các metrics còn yếu");
  }

  return insights;
}

// Get weekly data for charts (last 7 days)
export function getWeeklyData(
  habits: Array<{
    date: Date | string;
    score: number;
    exercise: number;
    water: number;
    sleep: number;
    calories: number;
  }>,
): Array<{
  date: string;
  score: number;
  exercise: number;
  water: number;
  sleep: number;
  calories: number;
}> {
  const weekData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const habit = habits.find((h) => {
      const hDate = new Date(h.date).toISOString().split("T")[0];
      return hDate === dateStr;
    });

    weekData.push({
      date: dateStr,
      score: habit?.score || 0,
      exercise: habit?.exercise || 0,
      water: habit?.water || 0,
      sleep: habit?.sleep || 0,
      calories: habit?.calories || 0,
    });
  }

  return weekData;
}

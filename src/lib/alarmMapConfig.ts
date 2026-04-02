import chernarusMap from "../assets/maps/DayZ_1.28.0_chernarus_map_16384px_sat.jpg";
import livoniaMap from "../assets/maps/DayZ_1.26.0_livonia_map_16384px_sat.jpg";
import sakhalMap from "../assets/maps/DayZ_1.3.0_sakhal_map_16384px_sat.jpg";

export type AlarmMission = "chernarusplus" | "enoch" | "sakhal";

export type AlarmMapDefinition = {
  mission: AlarmMission;
  label: string;
  imageUrl: string;
  imagePixelWidth: number;
  imagePixelHeight: number;
  worldWidth: number;
  worldHeight: number;
};

export const ALARM_MAPS: Record<AlarmMission, AlarmMapDefinition> = {
  chernarusplus: {
    mission: "chernarusplus",
    label: "Chernarus",
    imageUrl: chernarusMap,
    imagePixelWidth: 16384,
    imagePixelHeight: 16384,
    worldWidth: 15360,
    worldHeight: 15360,
  },
  enoch: {
    mission: "enoch",
    label: "Livonia",
    imageUrl: livoniaMap,
    imagePixelWidth: 16384,
    imagePixelHeight: 16384,
    worldWidth: 12800,
    worldHeight: 12800,
  },
  sakhal: {
    mission: "sakhal",
    label: "Sakhal",
    imageUrl: sakhalMap,
    imagePixelWidth: 16384,
    imagePixelHeight: 16384,
    worldWidth: 15360,
    worldHeight: 15360,
  },
};

export function normalizeMission(
  mission: string | null | undefined,
): AlarmMission {
  const normalized = mission?.trim().toLowerCase() ?? "";

  if (normalized.includes("chernarus")) {
    return "chernarusplus";
  }

  if (normalized.includes("enoch") || normalized.includes("livonia")) {
    return "enoch";
  }

  if (normalized.includes("sakhal")) {
    return "sakhal";
  }

  return "chernarusplus";
}

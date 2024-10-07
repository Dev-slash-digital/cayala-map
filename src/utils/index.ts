export const calculateWalkingTime = (distanceInMeters: number, walkingSpeed: number) => {
    const walkingTime = distanceInMeters / walkingSpeed / 60;
    return walkingTime > 1 ? walkingTime.toFixed(0) : walkingTime.toFixed(0);
  }
  
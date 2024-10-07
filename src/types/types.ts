export interface StepAction {
    bearing: 'Left' | 'Right' | 'Straight' | string; 
  }
  
export interface Step {
    action: StepAction;
    description: string;
  }
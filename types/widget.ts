export interface Widget {
  id: string
  type: string
  name: string
  icon: string
  position: {
    x: number
    y: number
  }
  properties?: Record<string, any>
}

export interface LogicBlock {
  id: string
  type: string
  category: string
  label: string
  inputs?: {
    name: string
    type: string
    defaultValue?: any
  }[]
  outputs?: {
    name: string
    type: string
  }[]
  pythonTemplate: string
}


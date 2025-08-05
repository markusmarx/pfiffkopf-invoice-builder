import { Grid, NumberInput, Text } from "@mantine/core";
import { DragVector, Template } from "../types";

export enum DragVectorDisplayType{
    Position,
    Size
}

export interface DragVectorInputProperties{
    dragVector: DragVector;
    displayType: DragVectorDisplayType;
    template: Template;
}
export function DragVectorInput(props: DragVectorInputProperties){

    return(
        <>
            <Text>{props.displayType === DragVectorDisplayType.Position ? "Position" : "Größe"}</Text>
            <Grid>
                <Grid.Col span={6}>
                    <NumberInput
                        decimalSeparator=","
                        defaultChecked={true}
                        suffix=" px"
                        description={props.displayType === DragVectorDisplayType.Position ? "X" : "Weite"}
                        {...props.dragVector.getInputPropsX(props.template)}
                        hideControls 
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <NumberInput
                        decimalSeparator=","
                        defaultChecked={true}
                        suffix=" px"
                        description={props.displayType === DragVectorDisplayType.Position ? "Y" : "Höhe"}
                        {...props.dragVector.getInputPropsY(props.template)}
                        hideControls 
                    />
                </Grid.Col>
            </Grid>
        </>
    );
}
export default DragVectorInput;
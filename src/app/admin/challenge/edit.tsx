import { Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput, required } from "react-admin";

export const ChallengeEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="question" validate={[required()]} label="Question" />
                <SelectInput source="type" validate={[required()]} label="Type" 
                    choices={[
                        {id: "CHOICE", name:"CHOICE"},
                        {id: "SPELLING", name:"SPELLING"},
                        {id: "WRITING", name:"WRITING"}
                    ]}/>
                <ReferenceInput source="lessonId" reference="lessons"/>
                <NumberInput source="order" validate={[required()]} label="Order" />
            </SimpleForm>
        </Edit>
    );
};

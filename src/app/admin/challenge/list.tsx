import { Datagrid, List, NumberField, ReferenceField, SelectField, TextField } from "react-admin";

export const ChallengeList = () => {
    return (
        <List>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="question" />
                <SelectField source="type" 
                    choices={[
                        { id: "CHOICE", name: "CHOICE"},
                        { id: "SPELLING", name: "SPELLING"},
                        { id: "WRITING", name: "WRITING"},

                    ]}/>
                <ReferenceField source="lessonId" reference="lessons" />
                <NumberField source="order" />
            </Datagrid>
        </List>
    );
};
import { Datagrid, List, NumberField, ReferenceField, TextField } from "react-admin";

export const ChallengeList = () => {
    return (
        <List>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="question" />
                <TextField source="type" />
                <ReferenceField source="lessonId" reference="lessons" />
                <NumberField source="order" />
            </Datagrid>
        </List>
    );
};
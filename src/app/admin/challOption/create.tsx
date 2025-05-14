import { BooleanInput, Create, ReferenceInput, SimpleForm, TextInput, required } from "react-admin";

export const ChallOptionCreate = () => {
    return (
        <Create>
            <SimpleForm>
                <TextInput source="text" validate={[required()]} label="Text answer" />
                <BooleanInput source="correct" label="Correct option" />
                <ReferenceInput source="challengeId" reference="challenges"/>
                <TextInput source="imageSrc" label="Image source"/>
                <TextInput source="audioSrc" label="Audio source"/>
            </SimpleForm>
        </Create>
    );
};

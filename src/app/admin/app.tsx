"use client";

import { Admin, ListGuesser, Resource } from "react-admin";
import simpileRestProvider from "ra-data-simple-rest";

import { CourseList } from "./course/list";
import { CourseCreate } from "./course/create";
import { CourseEdit } from "./course/edit";

import { UnitList } from "./unit/list";
import { UnitCreate } from "./unit/create";
import { UnitEdit } from "./unit/edit";

import { LessonList } from "./lesson/list";
import { LessonCreate } from "./lesson/create";
import { LessonEdit } from "./lesson/edit";
import { ChallengeList } from "./challenge/list";
import { ChallengeCreate } from "./challenge/create";
import { ChallengeEdit } from "./challenge/edit";

import { ChallOptionList } from "./challOption/list";
import { ChallOptionCreate } from "./challOption/create";
import { ChallOptionEdit } from "./challOption/edit";

const dataProvider = simpileRestProvider("/api");

const App = () => {
    return (
        <Admin dataProvider={dataProvider}>
            <Resource 
                name="courses" 
                list={CourseList} 
                create={CourseCreate}
                edit={CourseEdit}
                recordRepresentation="title" />
            <Resource 
                name="units" 
                list={UnitList} 
                create={UnitCreate}
                edit={UnitEdit}
                recordRepresentation="title" />
            <Resource 
                name="lessons" 
                list={LessonList} 
                create={LessonCreate}
                edit={LessonEdit}
                recordRepresentation="title" />
            <Resource 
                name="challenges" 
                list={ChallengeList} 
                create={ChallengeCreate}
                edit={ChallengeEdit}
                recordRepresentation="question" />
            <Resource 
                name="challOptions" 
                list={ChallOptionList} 
                create={ChallOptionCreate}
                edit={ChallOptionEdit}
                recordRepresentation="title" />
        </Admin>
    );
};
export default App;

/// <reference types="react" />
import { AnswerResponse, QuestionResponse } from '../../api';
export declare const VoteButtons: (props: {
    entity: QuestionResponse | AnswerResponse;
    question?: QuestionResponse;
}) => JSX.Element;

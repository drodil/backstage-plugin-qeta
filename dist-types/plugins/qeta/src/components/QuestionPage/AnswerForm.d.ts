/// <reference types="react" />
import { AnswerResponse, QuestionResponse } from '../../api';
import 'style-loader!css-loader!sass-loader!../../style/_AskPage.scss';
export declare const AnswerForm: (props: {
    question: QuestionResponse;
    onPost: (answer: AnswerResponse) => void;
}) => JSX.Element;

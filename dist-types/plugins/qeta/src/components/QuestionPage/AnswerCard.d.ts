/// <reference types="react" />
import { AnswerResponse, QuestionResponse } from '../../api';
import 'style-loader!css-loader!sass-loader!../../style/_QuestionCard.scss';
export declare const AnswerCard: (props: {
    answer: AnswerResponse;
    question: QuestionResponse;
}) => JSX.Element;

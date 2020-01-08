import { IFirebaseFunctionBuilder } from "./FirebaseFunctionBuilder"
import { IFirestore, IFirestoreDocumentSnapshot } from "./Firestore/IFirestore"
import {
    IFirebaseChange,
    IFirebaseDataSnapshot,
    IFirebaseEventContext,
    IFirebaseRealtimeDatabase,
} from "./RealtimeDatabase/IFirebaseRealtimeDatabase"

export interface IFirebaseDriver {
    realTimeDatabase(): IFirebaseRealtimeDatabase
    firestore(): IFirestore
    pubSubCl(): IPubSub
    runWith(runtimeOptions?: {
        memory: MemoryOption
        timeoutSeconds: number
    }): IFirebaseFunctionBuilder
}

export type MemoryOption = "128MB" | "256MB" | "512MB" | "1GB" | "2GB"

export interface IPubSub {
    topic(name: string): IPubSubTopic
}

export interface IPubSubTopic {
    publisher: IPubSubPublisher
}

export interface IPubSubPublisher {
    publish(data: Buffer): Promise<any>
}

export interface IFirebaseBuilderPubSub {
    schedule(schedule: string): IFirebaseScheduleBuilder
    topic(topic: string): IFirebaseTopicBuilder
}

export interface IFirebaseBuilderDatabase {
    ref(path: string): IFirebaseRefBuilder
}

export interface IFirebaseRunnable<T> {
    run: (data: T, context: any) => Promise<any>
}
export type CloudFunction<T> = IFirebaseRunnable<T> &
    ((input: any, context?: any) => PromiseLike<any>)

export interface IFirebaseScheduleBuilder {
    timeZone(timeZone: string): IFirebaseScheduleBuilder
    onRun(handler: (context: object) => PromiseLike<any>): CloudFunction<{}>
}

export interface IFirebaseTopicBuilder {
    onPublish(
        handler: (message: object, context: object) => any,
    ): CloudFunction<any>
}

export interface IFirebaseRefBuilder {
    onCreate(
        handler: (
            snapshot: IFirebaseDataSnapshot,
            context: IFirebaseEventContext,
        ) => Promise<any> | any,
    ): CloudFunction<any>

    onUpdate(
        handler: (
            change: IFirebaseChange<IFirebaseDataSnapshot>,
            context: IFirebaseEventContext,
        ) => Promise<any> | any,
    ): CloudFunction<any>

    onDelete(
        handler: (
            snapshot: IFirebaseDataSnapshot,
            context: IFirebaseEventContext,
        ) => Promise<any> | any,
    ): CloudFunction<any>

    onWrite(
        handler: (
            change: IFirebaseChange<IFirebaseDataSnapshot>,
            context: IFirebaseEventContext,
        ) => Promise<any> | any,
    ): CloudFunction<any>
}

export interface IFirestoreBuilder {
    document(path: string): IFirestoreDocumentBuilder
}

export interface IFirestoreDocumentBuilder {
    onCreate(
        handler: (
            snapshot: IFirestoreDocumentSnapshot,
            context: IFirebaseEventContext,
        ) => Promise<any>,
    ): CloudFunction<any>

    onUpdate(
        handler: (
            change: IFirebaseChange<IFirestoreDocumentSnapshot>,
            context: IFirebaseEventContext,
        ) => Promise<any>,
    ): CloudFunction<any>

    onDelete(
        handler: (
            snapshot: IFirestoreDocumentSnapshot,
            context: IFirebaseEventContext,
        ) => Promise<any>,
    ): CloudFunction<any>

    onWrite(
        handler: (
            change: IFirebaseChange<IFirestoreDocumentSnapshot>,
            context: IFirebaseEventContext,
        ) => Promise<any>,
    ): CloudFunction<any>
}

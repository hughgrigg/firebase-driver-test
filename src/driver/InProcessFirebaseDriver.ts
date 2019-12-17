import { IAsyncJobs } from "./AsyncJobs"
import { IFirebaseDriver, IPubSub, MemoryOption } from "./FirebaseDriver"
import {
    IFirebaseFunctionBuilder,
    SUPPORTED_REGIONS,
} from "./FirebaseFunctionBuilder"
import {
    InProcessFirestore,
    InProcessFirestoreBuilder,
} from "./Firestore/InProcessFirestore"
import { firebaseLikeId, fireStoreLikeId } from "./identifiers"
import {
    InProcessFirebaseBuilderPubSub,
    InProcessFirebasePubSubCl,
} from "./PubSub/InProcessFirebasePubSub"
import {
    IdGenerator,
    InProcessFirebaseBuilderDatabase,
    InProcessRealtimeDatabase,
} from "./RealtimeDatabase/InProcessRealtimeDatabase"

class InProcessFirebaseFunctionBuilder implements IFirebaseFunctionBuilder {
    constructor(
        readonly pubsub: InProcessFirebaseBuilderPubSub,
        readonly database: InProcessFirebaseBuilderDatabase,
        readonly firestore: InProcessFirestoreBuilder,
    ) {}

    region(
        ...regions: Array<typeof SUPPORTED_REGIONS[number]>
    ): IFirebaseFunctionBuilder {
        return this
    }
}

export class InProcessFirebaseDriver implements IFirebaseDriver, IAsyncJobs {
    private db: InProcessRealtimeDatabase | undefined
    private jobs: Array<Promise<any>> = []

    private builderDatabase: InProcessFirebaseBuilderDatabase | undefined
    private builderFirestore: InProcessFirestoreBuilder | undefined
    private builderPubSub: InProcessFirebaseBuilderPubSub | undefined
    private functionBuilder: InProcessFirebaseFunctionBuilder | undefined

    realTimeDatabase(
        idGenerator: IdGenerator = firebaseLikeId,
    ): InProcessRealtimeDatabase {
        if (!this.db) {
            this.db = new InProcessRealtimeDatabase(this, idGenerator)
        }
        return this.db
    }

    firestore(makeId: IdGenerator = fireStoreLikeId): InProcessFirestore {
        return new InProcessFirestore(makeId)
    }

    runWith(runtimeOptions?: {
        memory: MemoryOption
        timeoutSeconds: number
    }): InProcessFirebaseFunctionBuilder {
        if (!this.functionBuilder) {
            this.functionBuilder = new InProcessFirebaseFunctionBuilder(
                this.inProcessBuilderPubSub(),
                this.inProcessBuilderDatabase(),
                this.inProcessBuilderFirestore(),
            )
        }
        return this.functionBuilder
    }

    pubSubCl(): IPubSub {
        return new InProcessFirebasePubSubCl(this.inProcessBuilderPubSub())
    }

    inProcessBuilderDatabase(): InProcessFirebaseBuilderDatabase {
        if (!this.builderDatabase) {
            this.builderDatabase = new InProcessFirebaseBuilderDatabase(
                this.realTimeDatabase(),
            )
        }
        return this.builderDatabase
    }

    inProcessBuilderFirestore(): InProcessFirestoreBuilder {
        if (!this.builderFirestore) {
            this.builderFirestore = new InProcessFirestoreBuilder(
                this.firestore(),
            )
        }
        return this.builderFirestore
    }

    inProcessBuilderPubSub(): InProcessFirebaseBuilderPubSub {
        if (!this.builderPubSub) {
            this.builderPubSub = new InProcessFirebaseBuilderPubSub(this)
        }
        return this.builderPubSub
    }

    pushJob(job: Promise<any>): void {
        this.jobs.push(job)
    }

    async jobsComplete(): Promise<void> {
        // More jobs might be added by each job, so we can't just await Promise.all() here.
        while (this.jobs.length > 0) {
            await this.jobs.pop()
        }
    }
}

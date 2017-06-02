package com.thinkbiganalytics.nifi.provenance.cache;

/*-
 * #%L
 * thinkbig-nifi-provenance-repo
 * %%
 * Copyright (C) 2017 ThinkBig Analytics
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

import com.google.common.collect.Lists;
import com.thinkbiganalytics.nifi.provenance.jms.ProvenanceEventActiveMqWriter;
import com.thinkbiganalytics.nifi.provenance.model.FeedFlowFile;
import com.thinkbiganalytics.nifi.provenance.model.ProvenanceEventRecordDTO;
import com.thinkbiganalytics.nifi.provenance.model.ProvenanceEventRecordDTOHolder;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

/**
 * Created by sr186054 on 6/1/17.
 */
public class FeedFlowFileExpireListener implements FeedFlowFileCacheListener {

    @Autowired
    private ProvenanceEventActiveMqWriter provenanceEventActiveMqWriter;

    @Autowired
    private FeedFlowFileGuavaCache cache;

    public FeedFlowFileExpireListener() {

    }

    @PostConstruct
    private void init(){
        cache.subscribe(this);
    }

    @Override
    public void onInvalidate(FeedFlowFile flowFile) {

    }

    public void beforeInvalidation(List<FeedFlowFile> completedFlowFiles) {
        List<ProvenanceEventRecordDTO> dirtyEvents = completedFlowFiles.stream().flatMap(feedFlowFile -> feedFlowFile.getFeedFlowFileJobTrackingStats().getDirtyProcessorProvenanceEvents().stream()).collect(Collectors.toList());
        if(!dirtyEvents.isEmpty()) {
            ProvenanceEventRecordDTOHolder eventRecordDTOHolder = new ProvenanceEventRecordDTOHolder();
            eventRecordDTOHolder.setEvents(dirtyEvents);
            provenanceEventActiveMqWriter.writeBatchEvents(eventRecordDTOHolder);
        }
    }
}
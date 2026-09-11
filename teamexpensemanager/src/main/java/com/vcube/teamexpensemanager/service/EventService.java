package com.vcube.teamexpensemanager.service;

import java.util.List;

import com.vcube.teamexpensemanager.dto.EventRequest;
import com.vcube.teamexpensemanager.entity.Event;

public interface EventService {

	public Event createEvent(EventRequest request);

	List<Event> getAllEvents();

	public Event getEventById(Long id);

	public Event addMember(Long eventId, Long userId);

	public Event removeMember(Long eventId, Long userId);

}
